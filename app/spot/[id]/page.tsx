import { notFound } from "next/navigation";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { Clock, Frame, Mountain, Camera, MessageCircle } from "lucide-react";
import { AppHeader } from "@/components/AppHeader";
import { SpotCard } from "@/components/SpotCard";
import { SpotTypeBadge } from "@/components/SpotTypeBadge";
import { getRelatedSpots, getSpotById } from "@/lib/spot-queries";
import { spots, type Spot } from "@/lib/spots";

export function generateStaticParams() {
  return spots.map((s) => ({ id: s.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const spot = getSpotById(id);
  if (!spot) return { title: "서울숲 투어" };
  return {
    title: `${spot.name} · 서울숲 투어`,
    description: spot.shortDescription,
  };
}

export default async function SpotDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const spot = getSpotById(id);
  if (!spot) notFound();

  const related = getRelatedSpots(spot);

  return (
    <>
      <AppHeader title={spot.name} backHref="/" />
      <main className="flex-1 flex flex-col">
        <HeroImage spot={spot} />

        <div className="px-5 py-5 flex flex-col gap-6">
          <section className="space-y-2">
            <div className="flex items-center gap-2">
              <SpotTypeBadge type={spot.type} />
              {spot.pokemonStamp && (
                <span className="text-xs text-ink-muted">
                  {spot.pokemonStamp.pokemon} · ~
                  {spot.pokemonStamp.eventEndDate}
                </span>
              )}
            </div>
            <h1 className="text-2xl font-bold text-ink">{spot.name}</h1>
            {spot.nameEn && (
              <p className="text-sm text-ink-muted">{spot.nameEn}</p>
            )}
            <p className="text-[15px] text-ink-muted leading-relaxed pt-1">
              {spot.shortDescription}
            </p>
          </section>

          <article className="prose prose-sm max-w-none prose-headings:text-ink prose-headings:font-bold prose-p:text-ink prose-p:leading-relaxed prose-li:text-ink prose-strong:text-forest prose-strong:font-semibold prose-blockquote:border-forest prose-blockquote:text-ink-muted prose-a:text-forest prose-a:underline-offset-2">
            <ReactMarkdown>{spot.fullDescription}</ReactMarkdown>
          </article>

          {spot.photoTips && <PhotoTipsBlock tips={spot.photoTips} />}

          <Link
            href={`/ask?spot=${spot.id}`}
            className="flex items-center justify-center gap-2 rounded-2xl bg-forest text-beige-50 py-4 font-semibold active:scale-[0.99] transition-transform"
          >
            <MessageCircle className="size-5" />이 스팟에 대해 더 물어보기
          </Link>

          {related.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-base font-semibold text-ink">
                근처에 함께 둘러볼 스팟
              </h2>
              <div className="flex flex-col gap-2">
                {related.map((r) => (
                  <SpotCard key={r.id} spot={r} />
                ))}
              </div>
            </section>
          )}
        </div>
      </main>
    </>
  );
}

function HeroImage({ spot }: { spot: Spot }) {
  if (spot.imageUrl) {
    return (
      <div className="relative aspect-[4/3] w-full bg-beige-200">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={spot.imageUrl}
          alt={spot.name}
          className="w-full h-full object-cover"
        />
      </div>
    );
  }
  return (
    <div className="relative aspect-[4/3] w-full bg-gradient-to-br from-forest-100 via-beige-100 to-forest-200 flex items-center justify-center">
      <Camera className="size-12 text-forest/40" aria-hidden />
      <span className="sr-only">이미지 준비 중</span>
    </div>
  );
}

function PhotoTipsBlock({
  tips,
}: {
  tips: NonNullable<Spot["photoTips"]>;
}) {
  const items = [
    { icon: Clock, label: "추천 시간", value: tips.bestTime },
    { icon: Frame, label: "구도", value: tips.composition },
    { icon: Mountain, label: "배경", value: tips.background },
  ].filter((it) => Boolean(it.value));

  if (items.length === 0) return null;

  return (
    <section className="rounded-2xl bg-amber-50 ring-1 ring-amber-100 p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Camera className="size-4 text-amber-700" />
        <h2 className="text-sm font-semibold text-amber-900">포토 가이드</h2>
      </div>
      <ul className="space-y-2">
        {items.map((it) => (
          <li key={it.label} className="flex gap-3 text-sm">
            <it.icon className="size-4 text-amber-700 mt-0.5 shrink-0" />
            <div>
              <p className="font-medium text-ink">{it.label}</p>
              <p className="text-ink-muted leading-relaxed">{it.value}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
