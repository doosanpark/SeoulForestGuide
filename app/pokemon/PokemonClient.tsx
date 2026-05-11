"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Check,
  ChevronRight,
  LocateFixed,
  Loader2,
  Navigation,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { formatDistance, haversineMeters, type LatLng } from "@/lib/geo";
import type { Spot } from "@/lib/spots";

const STORAGE_KEY = "seoulforest:pokemon-visits";

interface PokemonClientProps {
  spots: Spot[];
}

export function PokemonClient({ spots }: PokemonClientProps) {
  const [visits, setVisits] = useState<Set<string>>(() => new Set());
  const [hydrated, setHydrated] = useState(false);
  const [userLocation, setUserLocation] = useState<LatLng | null>(null);
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const ids: string[] = JSON.parse(raw);
        setVisits(new Set(ids));
      }
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  const persist = (next: Set<string>) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]));
    } catch {
      /* ignore */
    }
  };

  const toggleVisit = (id: string) => {
    setVisits((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      persist(next);
      return next;
    });
  };

  const resetVisits = () => {
    if (!confirm("방문 기록을 초기화할까요?")) return;
    setVisits(new Set());
    persist(new Set());
  };

  const handleFindMe = () => {
    if (!("geolocation" in navigator)) {
      setLocationError("이 브라우저는 위치 기능을 지원하지 않아요.");
      return;
    }
    setLocating(true);
    setLocationError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        setLocating(false);
      },
      (err) => {
        setLocating(false);
        setLocationError(
          err.code === err.PERMISSION_DENIED
            ? "위치 권한이 차단되어 있어요. 브라우저 설정에서 허용해주세요."
            : "위치를 가져오지 못했어요.",
        );
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30_000 },
    );
  };

  const orderedSpots = useMemo(() => {
    if (!userLocation) return spots.map((s) => ({ spot: s, distance: undefined }));
    return spots
      .map((s) => ({
        spot: s,
        distance: haversineMeters(userLocation, { lat: s.lat, lng: s.lng }),
      }))
      .sort((a, b) => (a.distance ?? 0) - (b.distance ?? 0));
  }, [spots, userLocation]);

  const collected = hydrated ? visits.size : 0;
  const total = spots.length;
  const progress = total > 0 ? Math.round((collected / total) * 100) : 0;

  return (
    <main className="flex-1 px-5 py-5 flex flex-col gap-5">
      <section className="rounded-2xl bg-gradient-to-br from-purple-600 to-pink-500 text-white p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-2 text-purple-100">
          <Sparkles className="size-4" />
          <span className="text-xs tracking-wider">MEGA FESTA 2026</span>
        </div>
        <h2 className="text-xl font-bold leading-tight">
          포켓몬 스탬프 투어
        </h2>
        <p className="text-sm text-purple-100 mt-1">
          ~2026.6.21 · 서울숲 + 성수동 일대 6개 스팟
        </p>

        <div className="mt-4 space-y-1.5">
          <div className="flex items-baseline justify-between text-sm">
            <span className="opacity-90">방문 진행률</span>
            <span className="font-semibold">
              {collected} / {total}
            </span>
          </div>
          <div className="h-2 rounded-full bg-white/25 overflow-hidden">
            <div
              className="h-full bg-white transition-[width] duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </section>

      <section className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleFindMe}
          disabled={locating}
          className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-card ring-1 ring-border py-3 font-medium text-ink active:bg-accent/40 transition-colors disabled:opacity-60"
        >
          {locating ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <LocateFixed className="size-4" />
          )}
          {userLocation ? "위치 갱신" : "내 위치로 정렬"}
        </button>
        {collected > 0 && (
          <button
            type="button"
            onClick={resetVisits}
            aria-label="진행률 초기화"
            className="size-11 rounded-xl ring-1 ring-border bg-card text-ink-muted active:bg-accent/40 flex items-center justify-center"
          >
            <RotateCcw className="size-4" />
          </button>
        )}
      </section>

      {locationError && (
        <div className="rounded-xl bg-amber-50 ring-1 ring-amber-100 px-3 py-2 text-sm text-amber-900">
          {locationError}
        </div>
      )}

      <section className="flex flex-col gap-3">
        {orderedSpots.map(({ spot, distance }) => (
          <PokemonCard
            key={spot.id}
            spot={spot}
            distanceMeters={distance}
            visited={visits.has(spot.id)}
            onToggle={() => toggleVisit(spot.id)}
          />
        ))}
      </section>

      <p className="text-[11px] text-ink-muted text-center pt-2">
        방문 기록은 이 브라우저에만 저장돼요. 브라우저 데이터를 지우면
        초기화됩니다.
      </p>
    </main>
  );
}

function PokemonCard({
  spot,
  distanceMeters,
  visited,
  onToggle,
}: {
  spot: Spot;
  distanceMeters?: number;
  visited: boolean;
  onToggle: () => void;
}) {
  const pokemon = spot.pokemonStamp?.pokemon ?? "?";
  const directionsUrl = `https://map.kakao.com/link/to/${encodeURIComponent(
    spot.name,
  )},${spot.lat},${spot.lng}`;

  return (
    <article
      className={`rounded-2xl bg-card ring-1 p-4 shadow-sm transition-colors ${
        visited ? "ring-purple-200 bg-purple-50/50" : "ring-border"
      }`}
    >
      <div className="flex items-start gap-3">
        <button
          type="button"
          onClick={onToggle}
          aria-label={visited ? "방문 해제" : "방문 체크"}
          className={`size-9 shrink-0 rounded-full flex items-center justify-center transition-colors ${
            visited
              ? "bg-purple-600 text-white"
              : "bg-beige-100 text-ink-muted ring-1 ring-border"
          }`}
        >
          {visited && <Check className="size-5" />}
        </button>

        <div className="flex-1 min-w-0">
          <p className="text-xs text-ink-muted">{pokemon}</p>
          <h3 className="font-semibold text-ink truncate">{spot.name}</h3>
          <p className="text-sm text-ink-muted line-clamp-1 mt-0.5">
            {spot.shortDescription}
          </p>
          {typeof distanceMeters === "number" && (
            <p className="text-xs text-purple-700 mt-1.5 font-medium">
              {formatDistance(distanceMeters)} 거리
            </p>
          )}
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <Link
          href={`/spot/${spot.id}`}
          className="flex-1 flex items-center justify-center gap-1 rounded-xl ring-1 ring-border bg-card text-ink py-2 text-sm font-medium active:bg-accent/40 transition-colors"
        >
          상세 보기
          <ChevronRight className="size-4" />
        </Link>
        <a
          href={directionsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-1 rounded-xl bg-purple-600 text-white py-2 text-sm font-medium active:scale-[0.99] transition-transform"
        >
          <Navigation className="size-4" />
          길찾기
        </a>
      </div>
    </article>
  );
}
