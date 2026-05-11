import Link from "next/link";
import { Map, Camera, Sparkles, ArrowRight } from "lucide-react";
import { SpotCard } from "@/components/SpotCard";
import { getSpotById, isPokemonEventActive } from "@/lib/spot-queries";
import { POKEMON_EVENT_END, spots } from "@/lib/spots";

// 오늘의 추천 코스: 정문→사슴→거울연못→은행나무길→바람의언덕
const RECOMMENDED_COURSE_IDS = [
  "deer-yard",
  "mirror-pond",
  "ginkgo-path",
  "wind-hill",
];

function isAnyPokemonEventActive(): boolean {
  return spots.some((s) => isPokemonEventActive(s));
}

export default function HomePage() {
  const showPokemon = isAnyPokemonEventActive();
  const courseSpots = RECOMMENDED_COURSE_IDS.map(getSpotById).filter(
    (s): s is NonNullable<typeof s> => Boolean(s),
  );

  return (
    <main className="flex-1 px-5 py-7 flex flex-col gap-7">
      <section className="space-y-2">
        <p className="text-xs text-ink-muted tracking-[0.2em]">
          SEOUL FOREST TOUR
        </p>
        <h1 className="text-[28px] font-bold text-forest leading-[1.25]">
          서울숲 투어에
          <br />
          오신 것을 환영합니다
        </h1>
        <p className="text-ink-muted text-[15px] leading-relaxed pt-1">
          오늘 함께 둘러볼 스팟과 도슨트 해설을 미리 살펴보세요.
          <br />
          궁금한 식물·작품은 사진으로 바로 물어볼 수도 있어요.
        </p>
      </section>

      <section className="grid grid-cols-1 gap-3">
        <CtaCard
          href="/map"
          icon={<Map className="size-6" />}
          title="지도로 둘러보기"
          subtitle="내 위치 기반 추천 + 핀 보기"
          tone="primary"
        />
        <CtaCard
          href="/ask"
          icon={<Camera className="size-6" />}
          title="사진으로 물어보기"
          subtitle="식물·작품을 AI가 해설"
          tone="secondary"
        />
        {showPokemon && (
          <CtaCard
            href="/pokemon"
            icon={<Sparkles className="size-6" />}
            title="포켓몬 스탬프 투어"
            subtitle={`메가페스타 2026 · ~${POKEMON_EVENT_END}`}
            tone="accent"
          />
        )}
      </section>

      <section className="space-y-3">
        <div className="flex items-baseline justify-between">
          <h2 className="text-lg font-semibold text-ink">오늘의 추천 코스</h2>
          <p className="text-xs text-ink-muted">약 1시간 30분</p>
        </div>
        <div className="flex flex-col gap-2">
          {courseSpots.map((spot, i) => (
            <div key={spot.id} className="flex items-stretch gap-2">
              <div className="w-7 shrink-0 flex flex-col items-center">
                <span className="size-7 rounded-full bg-forest text-beige-50 text-sm font-bold flex items-center justify-center">
                  {i + 1}
                </span>
                {i < courseSpots.length - 1 && (
                  <div className="flex-1 w-px bg-forest-200 mt-1" />
                )}
              </div>
              <SpotCard spot={spot} className="flex-1 mb-1" />
            </div>
          ))}
        </div>
      </section>

      <footer className="mt-auto pt-4 pb-2 text-center text-xs text-ink-muted">
        <p>
          서울숲 투어 가이드 ·{" "}
          <Link href="/map" className="underline">
            전체 스팟 보기
          </Link>
        </p>
      </footer>
    </main>
  );
}

function CtaCard({
  href,
  icon,
  title,
  subtitle,
  tone,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  tone: "primary" | "secondary" | "accent";
}) {
  const toneClasses = {
    primary: "bg-forest text-beige-50",
    secondary: "bg-beige-200 text-ink ring-1 ring-border",
    accent: "bg-purple-600 text-white",
  }[tone];

  return (
    <Link
      href={href}
      className={`group flex items-center gap-4 rounded-2xl p-4 shadow-sm active:scale-[0.99] transition-transform ${toneClasses}`}
    >
      <div className="size-12 rounded-xl bg-black/10 flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold leading-tight">{title}</p>
        <p className="text-[13px] opacity-80 mt-0.5 truncate">{subtitle}</p>
      </div>
      <ArrowRight className="size-5 opacity-70 group-active:translate-x-0.5 transition-transform" />
    </Link>
  );
}
