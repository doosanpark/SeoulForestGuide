"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import ReactMarkdown from "react-markdown";
import { Camera, Image as ImageIcon, Loader2, X, Sparkles } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { SpotCard } from "@/components/SpotCard";
import { SpotTypeBadge } from "@/components/SpotTypeBadge";
import { resizeForUpload, type ResizedImage } from "@/lib/image-resize";
import { getSpotById } from "@/lib/spot-queries";

interface AnalyzeResponse {
  answer: string;
  relatedSpotIds: string[];
}

export function AskClient() {
  const search = useSearchParams();
  const spotId = search.get("spot") ?? undefined;
  const contextSpot = spotId ? getSpotById(spotId) : undefined;

  const fileInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const [resized, setResized] = useState<ResizedImage | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalyzeResponse | null>(null);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handlePick = async (file: File | null | undefined) => {
    if (!file) return;
    setError(null);
    setResult(null);
    try {
      const r = await resizeForUpload(file);
      setResized(r);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      const url = URL.createObjectURL(
        new Blob([Uint8Array.from(atob(r.base64), (c) => c.charCodeAt(0))], {
          type: r.mimeType,
        }),
      );
      setPreviewUrl(url);
    } catch (e) {
      console.error(e);
      setError("사진을 불러오지 못했어요. 다른 사진으로 시도해주세요.");
    }
  };

  const clearImage = () => {
    setResized(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setResult(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (galleryInputRef.current) galleryInputRef.current.value = "";
  };

  const handleSubmit = async () => {
    if (!resized) return;
    setLoading(true);
    setError(null);
    setResult(null);

    const coords = await getCoordsBestEffort();

    try {
      const res = await fetch("/api/analyze-photo", {
        method: "POST",
        headers: { "Content-Type": "application/json; charset=utf-8" },
        body: JSON.stringify({
          imageBase64: resized.base64,
          mimeType: resized.mimeType,
          userQuestion: question.trim() || undefined,
          spotId,
          ...(coords ?? {}),
        }),
      });
      const data = (await res.json()) as
        | AnalyzeResponse
        | { error: string };
      if (!res.ok || "error" in data) {
        setError(
          "error" in data ? data.error : `요청 실패 (${res.status})`,
        );
      } else {
        setResult(data);
      }
    } catch {
      setError("네트워크 오류예요. 잠시 후 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  };

  const relatedSpots =
    result?.relatedSpotIds
      .map((id) => getSpotById(id))
      .filter((s): s is NonNullable<typeof s> => Boolean(s)) ?? [];

  return (
    <main className="flex-1 px-5 py-6 flex flex-col gap-5">
      {contextSpot && (
        <section className="rounded-2xl bg-forest-50 ring-1 ring-forest-100 p-4 flex items-center gap-3">
          <Sparkles className="size-5 text-forest shrink-0" />
          <div className="min-w-0">
            <p className="text-xs text-ink-muted">이 스팟에 대해 묻는 중</p>
            <p className="font-semibold text-forest truncate flex items-center gap-2">
              {contextSpot.name}
              <SpotTypeBadge type={contextSpot.type} />
            </p>
          </div>
        </section>
      )}

      {!previewUrl ? (
        <section className="flex flex-col gap-3">
          <p className="text-[15px] text-ink leading-relaxed">
            사진을 찍거나 갤러리에서 골라주세요.
            <br />
            AI가 식물·작품을 식별해 해설해 드려요.
          </p>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => handlePick(e.target.files?.[0])}
          />
          <input
            ref={galleryInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handlePick(e.target.files?.[0])}
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center justify-center gap-2 rounded-2xl bg-forest text-beige-50 py-4 font-semibold active:scale-[0.99] transition-transform"
          >
            <Camera className="size-5" />
            카메라로 찍기
          </button>
          <button
            type="button"
            onClick={() => galleryInputRef.current?.click()}
            className="flex items-center justify-center gap-2 rounded-2xl ring-1 ring-border bg-card text-ink py-4 font-semibold active:bg-accent/40 transition-colors"
          >
            <ImageIcon className="size-5" />
            갤러리에서 고르기
          </button>
        </section>
      ) : (
        <section className="flex flex-col gap-4">
          <div className="relative rounded-2xl overflow-hidden bg-beige-200">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewUrl}
              alt="선택한 사진"
              className="w-full max-h-[55vh] object-contain bg-black/5"
            />
            <button
              type="button"
              onClick={clearImage}
              aria-label="사진 지우기"
              className="absolute top-2 right-2 size-9 rounded-full bg-black/55 text-white flex items-center justify-center"
            >
              <X className="size-4" />
            </button>
          </div>

          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-ink">
              궁금한 점이 있으면 적어주세요{" "}
              <span className="text-ink-muted font-normal">(선택)</span>
            </span>
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              rows={2}
              maxLength={300}
              disabled={loading}
              placeholder="예: 이 꽃은 무슨 꽃인가요?"
              className="rounded-xl ring-1 ring-border bg-card px-3 py-2.5 text-[15px] resize-none focus:outline-none focus:ring-2 focus:ring-forest disabled:opacity-60"
            />
          </label>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="flex items-center justify-center gap-2 rounded-2xl bg-forest text-beige-50 py-4 font-semibold active:scale-[0.99] transition-transform disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 className="size-5 animate-spin" />
                AI가 분석 중이에요...
              </>
            ) : (
              <>
                <Sparkles className="size-5" />
                분석하기
              </>
            )}
          </button>

          {loading && (
            <div className="rounded-2xl bg-card ring-1 ring-border p-4 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          )}

          {error && (
            <div className="rounded-xl bg-amber-50 ring-1 ring-amber-100 px-4 py-3 text-sm text-amber-900 leading-relaxed">
              {error}
            </div>
          )}

          {result && (
            <section className="flex flex-col gap-4">
              <article className="rounded-2xl bg-card ring-1 ring-border p-4 prose prose-sm max-w-none prose-headings:text-ink prose-p:text-ink prose-p:leading-relaxed prose-strong:text-forest">
                <ReactMarkdown>{result.answer}</ReactMarkdown>
              </article>

              {relatedSpots.length > 0 && (
                <div className="flex flex-col gap-2">
                  <h2 className="text-sm font-semibold text-ink">
                    근처 추천 스팟
                  </h2>
                  {relatedSpots.map((s) => (
                    <SpotCard key={s.id} spot={s} />
                  ))}
                </div>
              )}

              <button
                type="button"
                onClick={clearImage}
                className="rounded-xl ring-1 ring-border bg-card text-ink py-3 font-semibold active:bg-accent/40 transition-colors"
              >
                다른 사진으로 다시 묻기
              </button>
            </section>
          )}
        </section>
      )}

      <p className="text-[11px] text-ink-muted text-center pt-2">
        사진은 AI 분석 후 서버에 저장되지 않으며, 위치 EXIF는 전송 전에
        제거됩니다.
      </p>

      {contextSpot && (
        <Link
          href={`/spot/${contextSpot.id}`}
          className="text-center text-sm text-forest underline underline-offset-2"
        >
          ← {contextSpot.name} 상세로 돌아가기
        </Link>
      )}
    </main>
  );
}

async function getCoordsBestEffort(): Promise<
  { lat: number; lng: number } | null
> {
  if (typeof navigator === "undefined" || !navigator.geolocation) return null;
  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => resolve(null),
      { enableHighAccuracy: false, timeout: 3000, maximumAge: 60_000 },
    );
  });
}
