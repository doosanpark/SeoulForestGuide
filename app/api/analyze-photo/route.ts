import { GoogleGenAI } from "@google/genai";
import { type NextRequest, NextResponse } from "next/server";

import { takeDailyCap, takeRateLimit } from "@/lib/rate-limit";
import { getSpotById, getSpotsNearby } from "@/lib/spot-queries";
import { spots } from "@/lib/spots";

export const runtime = "nodejs";
export const maxDuration = 30;

const HOUR_MS = 60 * 60 * 1000;
const PER_IP_HOURLY = Number(process.env.ANALYZE_PER_IP_HOURLY ?? 20);
const DAILY_GLOBAL_CAP = Number(process.env.ANALYZE_DAILY_LIMIT ?? 500);
const MAX_BASE64_BYTES = 6 * 1024 * 1024; // ~6MB base64 → ~4.5MB binary
const ALLOWED_MIME = new Set(["image/jpeg", "image/png", "image/webp"]);

const SYSTEM_PROMPT = `당신은 서울숲 투어 가이드입니다. 사용자가 보낸 사진은
서울숲 또는 2026 서울국제정원박람회(5/1~10/27, 167개 정원) 정원 작품일 가능성이 높습니다.

답변 가이드라인:
- 사진에서 보이는 식물·조형물·작품을 식별
- 서울숲 또는 정원박람회 맥락에서 의미를 풀어 설명
- 친근한 가이드 톤. 한국어로 답변
- 정확하지 않은 정보는 추측하지 말고 "확실하지 않다"고 명시
- 답변은 3~5문장으로 간결하게

근처 스팟 정보 (참고용):
${spots.map((s) => `- ${s.name}: ${s.shortDescription}`).join("\n")}`;

interface AnalyzeBody {
  imageBase64?: string;
  mimeType?: string;
  userQuestion?: string;
  lat?: number;
  lng?: number;
  spotId?: string;
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "AI 키가 설정되지 않았어요. 관리자에게 문의해주세요." },
      { status: 503 },
    );
  }

  let body: AnalyzeBody;
  try {
    body = (await req.json()) as AnalyzeBody;
  } catch {
    return NextResponse.json({ error: "잘못된 요청이에요." }, { status: 400 });
  }

  const { imageBase64, mimeType, userQuestion, lat, lng, spotId } = body;

  if (!imageBase64 || !mimeType) {
    return NextResponse.json(
      { error: "사진이 필요해요." },
      { status: 400 },
    );
  }
  if (!ALLOWED_MIME.has(mimeType)) {
    return NextResponse.json(
      { error: "지원하지 않는 이미지 형식이에요. (JPEG/PNG/WebP만 가능)" },
      { status: 400 },
    );
  }
  if (imageBase64.length > MAX_BASE64_BYTES) {
    return NextResponse.json(
      { error: "사진 용량이 너무 커요. 다시 시도해주세요." },
      { status: 413 },
    );
  }

  const ip = clientIp(req);
  const rl = takeRateLimit(`analyze:${ip}`, PER_IP_HOURLY, HOUR_MS);
  if (!rl.allowed) {
    return NextResponse.json(
      {
        error: `시간당 분석 한도(${PER_IP_HOURLY}회)를 초과했어요. 잠시 후 다시 시도해주세요.`,
      },
      { status: 429 },
    );
  }
  if (!takeDailyCap(DAILY_GLOBAL_CAP)) {
    return NextResponse.json(
      { error: "오늘 분석 한도에 도달했어요. 내일 다시 시도해주세요." },
      { status: 429 },
    );
  }

  const ai = new GoogleGenAI({ apiKey });

  const spotContext = spotId ? getSpotById(spotId) : undefined;
  const contextNote = spotContext
    ? `\n\n현재 스팟 컨텍스트: "${spotContext.name}" — ${spotContext.shortDescription}`
    : "";
  const locationNote =
    typeof lat === "number" && typeof lng === "number"
      ? `\n\n사용자 현재 위치: 위도 ${lat.toFixed(5)}, 경도 ${lng.toFixed(5)}`
      : "";

  const prompt = `${SYSTEM_PROMPT}${contextNote}${locationNote}\n\n사용자 질문: ${
    userQuestion?.trim() || "이게 무엇인지 알려주세요"
  }`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [
            { inlineData: { data: imageBase64, mimeType } },
            { text: prompt },
          ],
        },
      ],
    });

    const answer = response.text?.trim() ?? "";
    if (!answer) {
      return NextResponse.json(
        { error: "답변을 받지 못했어요. 다시 시도해주세요." },
        { status: 502 },
      );
    }

    const relatedSpots =
      typeof lat === "number" && typeof lng === "number"
        ? getSpotsNearby({ lat, lng }, { limit: 2 }).map((s) => s.id)
        : spotContext?.relatedSpotIds?.slice(0, 2) ?? [];

    return NextResponse.json({
      answer,
      relatedSpotIds: relatedSpots,
    });
  } catch (err) {
    console.error("Gemini error:", err);
    return NextResponse.json(
      { error: "AI 분석에 실패했어요. 잠시 후 다시 시도해주세요." },
      { status: 502 },
    );
  }
}

function clientIp(req: NextRequest): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  const real = req.headers.get("x-real-ip");
  if (real) return real;
  return "unknown";
}
