"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { LocateFixed, Loader2, AlertTriangle } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { SpotCard } from "@/components/SpotCard";
import { SpotTypeBadge } from "@/components/SpotTypeBadge";
import { loadKakaoMaps } from "@/lib/kakao-loader";
import { CURRENT_LOCATION_PIN, PIN_SIZE, pinDataUrl } from "@/lib/map-pins";
import {
  SEOUL_FOREST_CENTER,
  formatDistance,
  haversineMeters,
  type LatLng,
} from "@/lib/geo";
import type { Spot } from "@/lib/spots";

interface MapClientProps {
  spots: Spot[];
  kakaoKey: string | undefined;
}

const TYPE_LEGEND: { type: Spot["type"]; label: string }[] = [
  { type: "guide", label: "도슨트" },
  { type: "photo", label: "포토" },
  { type: "pokemon", label: "포켓몬" },
  { type: "garden", label: "정원" },
];

export function MapClient({ spots, kakaoKey }: MapClientProps) {
  const mapDivRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const userMarkerRef = useRef<any>(null);

  const [selectedSpot, setSelectedSpot] = useState<Spot | null>(null);
  const [userLocation, setUserLocation] = useState<LatLng | null>(null);
  const [mapError, setMapError] = useState<string | null>(null);
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Init map + render all spot markers.
  useEffect(() => {
    if (!kakaoKey) {
      setMapError("카카오맵 키가 설정되지 않았어요. 관리자에게 문의하세요.");
      return;
    }
    let cancelled = false;

    loadKakaoMaps(kakaoKey)
      .then((kakao) => {
        if (cancelled || !mapDivRef.current) return;
        const map = new kakao.maps.Map(mapDivRef.current, {
          center: new kakao.maps.LatLng(
            SEOUL_FOREST_CENTER.lat,
            SEOUL_FOREST_CENTER.lng,
          ),
          level: 4,
        });
        mapRef.current = map;

        for (const spot of spots) {
          const image = new kakao.maps.MarkerImage(
            pinDataUrl(spot.type),
            new kakao.maps.Size(PIN_SIZE.width, PIN_SIZE.height),
            {
              offset: new kakao.maps.Point(PIN_SIZE.width / 2, PIN_SIZE.height),
            },
          );
          const marker = new kakao.maps.Marker({
            position: new kakao.maps.LatLng(spot.lat, spot.lng),
            image,
            title: spot.name,
          });
          marker.setMap(map);
          kakao.maps.event.addListener(marker, "click", () => {
            setSelectedSpot(spot);
            map.panTo(new kakao.maps.LatLng(spot.lat, spot.lng));
          });
        }
      })
      .catch((err: Error) => {
        if (!cancelled) {
          setMapError(`지도 로드 실패: ${err.message}`);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [spots, kakaoKey]);

  const handleFindMe = () => {
    if (!("geolocation" in navigator)) {
      setLocationError("이 브라우저는 위치 기능을 지원하지 않아요.");
      return;
    }
    setLocating(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };
        setUserLocation(loc);
        setLocating(false);

        const kakao = window.kakao;
        const map = mapRef.current;
        if (!kakao?.maps || !map) return;

        const pos2 = new kakao.maps.LatLng(loc.lat, loc.lng);
        map.panTo(pos2);

        if (userMarkerRef.current) {
          userMarkerRef.current.setMap(null);
        }
        const image = new kakao.maps.MarkerImage(
          CURRENT_LOCATION_PIN.dataUrl,
          new kakao.maps.Size(
            CURRENT_LOCATION_PIN.size.width,
            CURRENT_LOCATION_PIN.size.height,
          ),
          {
            offset: new kakao.maps.Point(
              CURRENT_LOCATION_PIN.size.width / 2,
              CURRENT_LOCATION_PIN.size.height / 2,
            ),
          },
        );
        const marker = new kakao.maps.Marker({
          position: pos2,
          image,
          zIndex: 999,
          title: "내 위치",
        });
        marker.setMap(map);
        userMarkerRef.current = marker;
      },
      (err) => {
        setLocating(false);
        if (err.code === err.PERMISSION_DENIED) {
          setLocationError(
            "위치 권한이 차단되어 있어요. 브라우저 설정에서 허용해주세요.",
          );
        } else {
          setLocationError("위치를 가져오지 못했어요. 잠시 후 다시 시도해주세요.");
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30_000 },
    );
  };

  const orderedSpots = useMemo(() => {
    if (!userLocation) {
      return spots.map((s) => ({ spot: s, distanceMeters: undefined }));
    }
    return spots
      .map((s) => ({
        spot: s,
        distanceMeters: haversineMeters(userLocation, {
          lat: s.lat,
          lng: s.lng,
        }),
      }))
      .sort((a, b) => (a.distanceMeters ?? 0) - (b.distanceMeters ?? 0));
  }, [spots, userLocation]);

  return (
    <main className="flex-1 flex flex-col">
      <section className="relative w-full h-[55vh] min-h-[320px] bg-beige-100">
        <div ref={mapDivRef} className="absolute inset-0" />

        {mapError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center gap-3 bg-beige-100">
            <AlertTriangle className="size-8 text-amber-700" />
            <p className="text-sm text-ink-muted">{mapError}</p>
          </div>
        )}

        {!mapError && (
          <>
            <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-xl p-2 ring-1 ring-border shadow-sm">
              <ul className="grid grid-cols-2 gap-x-3 gap-y-1 text-[11px]">
                {TYPE_LEGEND.map((t) => (
                  <li key={t.type} className="flex items-center gap-1.5">
                    <span
                      aria-hidden
                      className="inline-block size-2.5 rounded-full"
                      style={{ backgroundColor: pinColor(t.type) }}
                    />
                    <span className="text-ink">{t.label}</span>
                  </li>
                ))}
              </ul>
            </div>

            <button
              type="button"
              onClick={handleFindMe}
              disabled={locating}
              className="absolute bottom-4 right-4 size-12 rounded-full bg-white shadow-md ring-1 ring-border flex items-center justify-center text-forest active:scale-95 transition-transform disabled:opacity-60"
              aria-label="내 위치"
            >
              {locating ? (
                <Loader2 className="size-5 animate-spin" />
              ) : (
                <LocateFixed className="size-5" />
              )}
            </button>
          </>
        )}
      </section>

      <section className="flex-1 px-5 py-4 flex flex-col gap-3">
        {locationError && (
          <div className="rounded-xl bg-amber-50 ring-1 ring-amber-100 px-3 py-2 text-sm text-amber-900">
            {locationError}
          </div>
        )}

        <div className="flex items-baseline justify-between">
          <h2 className="text-base font-semibold text-ink">
            {userLocation ? "가까운 순" : "전체 스팟"}
          </h2>
          <p className="text-xs text-ink-muted">{orderedSpots.length}개</p>
        </div>

        <div className="flex flex-col gap-2 pb-4">
          {orderedSpots.map(({ spot, distanceMeters }) => (
            <SpotCard
              key={spot.id}
              spot={spot}
              distanceMeters={distanceMeters}
            />
          ))}
        </div>
      </section>

      <Sheet
        open={!!selectedSpot}
        onOpenChange={(open) => {
          if (!open) setSelectedSpot(null);
        }}
      >
        <SheetContent
          side="bottom"
          className="rounded-t-3xl max-h-[75vh] overflow-y-auto"
        >
          {selectedSpot && (
            <>
              <SheetHeader className="text-left">
                <div className="flex items-center gap-2">
                  <SpotTypeBadge type={selectedSpot.type} />
                  {userLocation && (
                    <span className="text-xs text-ink-muted">
                      {formatDistance(
                        haversineMeters(userLocation, {
                          lat: selectedSpot.lat,
                          lng: selectedSpot.lng,
                        }),
                      )}
                    </span>
                  )}
                </div>
                <SheetTitle className="text-xl">{selectedSpot.name}</SheetTitle>
                <SheetDescription className="text-ink-muted leading-relaxed">
                  {selectedSpot.shortDescription}
                </SheetDescription>
              </SheetHeader>

              <div className="mt-5 flex flex-col gap-2">
                <Link
                  href={`/spot/${selectedSpot.id}`}
                  className="flex items-center justify-center rounded-xl bg-forest text-beige-50 py-3 font-semibold active:scale-[0.99] transition-transform"
                >
                  자세히 보기
                </Link>
                <a
                  href={`https://map.kakao.com/link/to/${encodeURIComponent(
                    selectedSpot.name,
                  )},${selectedSpot.lat},${selectedSpot.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center rounded-xl ring-1 ring-border bg-card py-3 font-semibold text-ink active:bg-accent/40 transition-colors"
                >
                  카카오맵에서 길찾기
                </a>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </main>
  );
}

function pinColor(type: Spot["type"]): string {
  switch (type) {
    case "guide":
      return "#2D5F3F";
    case "photo":
      return "#D97706";
    case "pokemon":
      return "#9333EA";
    case "garden":
      return "#0284C7";
  }
}
