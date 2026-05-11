import { haversineMeters, type LatLng } from "./geo";
import { spots, type Spot, type SpotType } from "./spots";

export function getSpotById(id: string): Spot | undefined {
  return spots.find((s) => s.id === id);
}

export function getSpotsByType(type: SpotType): Spot[] {
  return spots.filter((s) => s.type === type);
}

export function getRelatedSpots(spot: Spot): Spot[] {
  if (!spot.relatedSpotIds?.length) return [];
  return spot.relatedSpotIds
    .map((id) => getSpotById(id))
    .filter((s): s is Spot => Boolean(s));
}

export interface SpotWithDistance extends Spot {
  distanceMeters: number;
}

export function getSpotsNearby(
  origin: LatLng,
  options: { limit?: number; type?: SpotType } = {},
): SpotWithDistance[] {
  const { limit, type } = options;
  const pool = type ? getSpotsByType(type) : spots;

  const enriched = pool.map((s) => ({
    ...s,
    distanceMeters: haversineMeters(origin, { lat: s.lat, lng: s.lng }),
  }));

  enriched.sort((a, b) => a.distanceMeters - b.distanceMeters);
  return typeof limit === "number" ? enriched.slice(0, limit) : enriched;
}

// 포켓몬 이벤트가 아직 유효한지 (해당 스팟의 종료일 기준)
export function isPokemonEventActive(
  spot: Spot,
  now: Date = new Date(),
): boolean {
  if (spot.type !== "pokemon" || !spot.pokemonStamp) return false;
  const end = new Date(spot.pokemonStamp.eventEndDate);
  return now <= end;
}
