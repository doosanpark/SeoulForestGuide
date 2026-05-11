// 카카오맵 JS SDK 싱글톤 로더.
// autoload=false 옵션으로 명시 초기화 — race condition 회피.
//
// SDK 글로벌은 `window.kakao.maps`로 노출. 공식 TS 타입이 없어 최소한만 declare.

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    kakao: any;
  }
}

let loadingPromise: Promise<typeof window.kakao> | null = null;

export function loadKakaoMaps(appKey: string): Promise<typeof window.kakao> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Kakao Maps requires a browser context"));
  }
  if (window.kakao?.maps?.LatLng) {
    return Promise.resolve(window.kakao);
  }
  if (loadingPromise) return loadingPromise;

  loadingPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      "script[data-kakao-maps]",
    );

    const onReady = () => {
      try {
        window.kakao.maps.load(() => resolve(window.kakao));
      } catch (err) {
        reject(err);
      }
    };

    if (existing) {
      if (window.kakao?.maps) {
        onReady();
      } else {
        existing.addEventListener("load", onReady, { once: true });
        existing.addEventListener(
          "error",
          () => reject(new Error("Kakao SDK script failed to load")),
          { once: true },
        );
      }
      return;
    }

    const script = document.createElement("script");
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${appKey}&autoload=false`;
    script.async = true;
    script.dataset.kakaoMaps = "true";
    script.addEventListener("load", onReady, { once: true });
    script.addEventListener(
      "error",
      () => {
        loadingPromise = null;
        reject(new Error("Kakao SDK script failed to load"));
      },
      { once: true },
    );
    document.head.appendChild(script);
  });

  return loadingPromise;
}
