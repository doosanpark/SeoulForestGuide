import Link from "next/link";
import { Calendar } from "lucide-react";
import { AppHeader } from "@/components/AppHeader";
import { PokemonClient } from "./PokemonClient";
import {
  getSpotsByType,
  isPokemonEventActive,
} from "@/lib/spot-queries";
import { POKEMON_EVENT_END } from "@/lib/spots";

export const metadata = {
  title: "포켓몬 스탬프 투어 · 서울숲 투어",
};

export default function PokemonPage() {
  const pokemonSpots = getSpotsByType("pokemon");
  const stillActive = pokemonSpots.some((s) => isPokemonEventActive(s));

  return (
    <>
      <AppHeader title="포켓몬 스탬프 투어" backHref="/" />
      {stillActive ? (
        <PokemonClient spots={pokemonSpots} />
      ) : (
        <EventEnded />
      )}
    </>
  );
}

function EventEnded() {
  return (
    <main className="flex-1 px-5 py-8 flex flex-col items-center justify-center text-center gap-4">
      <div className="size-16 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center">
        <Calendar className="size-7" />
      </div>
      <div className="space-y-2">
        <h2 className="text-xl font-bold text-ink">
          이벤트가 종료되었어요
        </h2>
        <p className="text-ink-muted leading-relaxed">
          메가페스타 2026 포켓몬 스탬프 투어는 {POKEMON_EVENT_END}에
          종료되었습니다.
          <br />
          서울숲의 다른 스팟도 둘러보세요.
        </p>
      </div>
      <Link
        href="/map"
        className="rounded-xl bg-forest text-beige-50 px-6 py-3 font-semibold"
      >
        지도로 둘러보기
      </Link>
    </main>
  );
}
