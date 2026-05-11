import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "서울숲 투어 가이드",
    short_name: "서울숲 투어",
    description:
      "서울숲 오프라인 투어를 위한 모바일 가이드. 도슨트 해설 · 포토스팟 · AI 사진 분석.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#F5F1E8",
    theme_color: "#2D5F3F",
    lang: "ko",
    categories: ["travel", "lifestyle", "navigation"],
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/icon",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icon0",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon0",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
