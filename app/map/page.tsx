import { AppHeader } from "@/components/AppHeader";
import { MapClient } from "./MapClient";
import { spots } from "@/lib/spots";

export const metadata = {
  title: "지도 · 서울숲 투어",
};

export default function MapPage() {
  return (
    <>
      <AppHeader title="지도" backHref="/" />
      <MapClient
        spots={spots}
        kakaoKey={process.env.NEXT_PUBLIC_KAKAO_MAP_KEY}
      />
    </>
  );
}
