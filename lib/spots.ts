// 서울숲 투어 스팟 데이터
//
// 좌표는 모두 검증 필요 — 카카오맵 또는 현장에서 직접 측정한 값으로 교체할 것.
// fullDescription은 마크다운. 추후 CMS/DB로 옮길 수 있도록 평탄한 구조 유지.

export type SpotType = "guide" | "photo" | "pokemon" | "garden";

export interface PhotoTips {
  bestTime?: string;
  composition?: string;
  background?: string;
}

export interface PokemonStamp {
  pokemon: string;
  eventEndDate: string; // ISO date, 이벤트 종료 2026-06-21
}

export interface Spot {
  id: string;
  name: string;
  nameEn?: string;
  type: SpotType;
  lat: number;
  lng: number;
  shortDescription: string;
  fullDescription: string;
  photoTips?: PhotoTips;
  pokemonStamp?: PokemonStamp;
  imageUrl?: string;
  relatedSpotIds?: string[];
}

// 포켓몬 메가페스타 2026 이벤트 종료일
export const POKEMON_EVENT_END = "2026-06-21";

// TODO: 좌표 검증 — 모든 lat/lng는 카카오맵에서 실측 필요
export const spots: Spot[] = [
  {
    id: "mirror-pond",
    name: "거울연못",
    nameEn: "Mirror Pond",
    type: "photo",
    lat: 37.5443,
    lng: 127.0392,
    shortDescription:
      "서울숲의 시그니처 포토스팟. 사슴 조각상 반영이 아름다워요.",
    fullDescription: `## 거울연못

서울숲을 대표하는 포토스팟. 잔잔한 수면에 비치는 사슴 조각상이 시그니처 이미지로 자주 사용됩니다.

수면이 잔잔해지는 **이른 오전**과 **일몰 1시간 전**이 가장 아름답고, 바람이 강한 날은 반영이 흐트러져 컨디션이 떨어집니다.

연못 주변은 평지라 휠체어·유모차 접근도 무리가 없습니다.`,
    photoTips: {
      bestTime: "맑은 날 오전 또는 일몰 1시간 전",
      composition: "수면에 비친 사슴 조각상과 실물을 같이 담아 좌우대칭으로",
      background: "수면 너머의 나무 라인을 살리세요",
    },
    relatedSpotIds: ["deer-yard", "ginkgo-path"],
  },
  {
    id: "ginkgo-path",
    name: "은행나무길",
    nameEn: "Ginkgo Path",
    type: "photo",
    lat: 37.545,
    lng: 127.0385,
    shortDescription:
      "포켓몬 시크릿 포레스트가 열리는 그 길. 가을엔 노란 터널.",
    fullDescription: `## 은행나무길

서울숲 북쪽으로 이어지는 은행나무 가로수길. **10월 말~11월 중순** 단풍 시즌이 절정이지만, 늦봄~여름의 진녹색 터널도 좋습니다.

2026 메가페스타 기간(5/1~6/21)에는 이 길 일대가 **포켓몬 시크릿 포레스트** 테마 공간으로 운영되어 평소와 분위기가 다릅니다.

길이 좁아 단체 촬영 시 후속 그룹의 동선을 고려해주세요.`,
    photoTips: {
      bestTime: "단풍 시즌 오전 10시 ~ 정오 (역광 활용)",
      composition: "길 가운데에서 양옆 은행나무를 프레임 양쪽에 배치",
      background: "원근감이 살아나도록 길 끝의 소실점을 중앙에",
    },
    relatedSpotIds: ["pokemon-snorlax", "mirror-pond"],
  },
  {
    id: "pokemon-snorlax",
    name: "포켓몬 시크릿 포레스트 입구",
    nameEn: "Pokémon Secret Forest Entrance",
    type: "pokemon",
    lat: 37.545,
    lng: 127.0385,
    shortDescription:
      "잠만보 스탬프 획득 가능. 메가페스타 2026 핵심 스팟.",
    fullDescription: `## 포켓몬 시크릿 포레스트

2026 서울국제정원박람회의 일환으로 조성된 약 **2,800㎡** 규모의 신비로운 숲 테마 공간.

- **운영 시간**: 12:00 ~ 19:00
- **입장료**: 무료
- **운영 기간**: ~2026.6.21

입구에서 **잠만보 스탬프**를 받을 수 있고, 내부 곳곳에 포토 포인트가 숨어 있습니다. 평일 오후 1시 전후가 가장 한산합니다.`,
    pokemonStamp: {
      pokemon: "잠만보",
      eventEndDate: POKEMON_EVENT_END,
    },
    relatedSpotIds: ["ginkgo-path", "rainbow-eevee"],
  },
  {
    id: "deer-yard",
    name: "사슴마당",
    nameEn: "Deer Yard",
    type: "guide",
    lat: 37.5438,
    lng: 127.0398,
    shortDescription:
      "서울숲의 상징. 꽃사슴이 자유롭게 노니는 자연방사 구역.",
    fullDescription: `## 사슴마당

서울숲의 가장 상징적인 공간. **꽃사슴 약 20여 마리**가 자연 상태로 방사되어 있습니다.

2005년 서울숲 개원 당시부터 운영된 구역으로, 시민들이 사슴 먹이를 가까이에서 줄 수 있도록 **사슴 먹이주기 체험**도 운영합니다 (유료, 매표소 안내).

> 사슴은 야생동물입니다. 갑작스러운 접근이나 큰 소리는 피해주세요.`,
    relatedSpotIds: ["mirror-pond", "family-yard"],
  },
  {
    id: "wind-hill",
    name: "바람의언덕",
    nameEn: "Wind Hill",
    type: "photo",
    lat: 37.5455,
    lng: 127.0405,
    shortDescription:
      "탁 트인 잔디 언덕. 서울숲에서 가장 하늘이 넓은 자리.",
    fullDescription: `## 바람의언덕

서울숲 동편의 작은 잔디 언덕. 사방이 트여 있어 **광활한 하늘 배경**의 인물 사진에 강합니다.

해 질 무렵 응봉산 너머로 떨어지는 노을이 좋고, 바람이 강한 날은 머리카락이 날리는 동적 컷을 잡기 좋습니다.

돗자리·간단한 피크닉도 허용되지만 음식 쓰레기는 꼭 챙겨가세요.`,
    photoTips: {
      bestTime: "일몰 30분 전 ~ 일몰 직후",
      composition: "로우앵글로 사람과 하늘 비율 1:2",
      background: "구름 결을 살릴 수 있는 맑은 날 또는 옅은 흐림",
    },
    relatedSpotIds: ["family-yard", "garden-award-2026"],
  },
  {
    id: "insect-botanic",
    name: "곤충식물원",
    nameEn: "Insect & Botanic Garden",
    type: "guide",
    lat: 37.5442,
    lng: 127.041,
    shortDescription:
      "실내 온실 + 곤충 전시. 비 오는 날 대피처로도 좋아요.",
    fullDescription: `## 곤충식물원

서울숲 내부의 작은 실내 시설. **열대·아열대 식물 온실**과 **나비/장수풍뎅이 등 곤충 전시**가 한 건물에 있습니다.

가족 단위 방문객, 특히 어린이 동반 시 30~40분 둘러보기 좋고, 우천 시 대피처로도 활용 가능합니다.

- **운영 시간**: 10:00 ~ 17:00 (월요일 휴관)
- **입장료**: 무료`,
    relatedSpotIds: ["family-yard", "deer-yard"],
  },
  {
    id: "family-yard",
    name: "가족마당",
    nameEn: "Family Yard",
    type: "guide",
    lat: 37.5448,
    lng: 127.0378,
    shortDescription:
      "넓은 잔디광장. 피크닉 1번지이자 야외 프로그램이 자주 열리는 곳.",
    fullDescription: `## 가족마당

서울숲 정문에서 가까운 **중앙 잔디광장**. 주말이면 가족 단위 피크닉이 빼곡합니다.

야외 콘서트·플리마켓 등 이벤트가 자주 열리니, 방문 전 [서울숲 공식 캘린더](https://parks.seoul.go.kr)를 확인하세요.

- 그늘이 적어 한여름에는 텐트/파라솔 필수 (1인용은 허용)`,
    relatedSpotIds: ["deer-yard", "insect-botanic"],
  },
  {
    id: "rainbow-eevee",
    name: "무지개어린이공원 (이브이 스팟)",
    nameEn: "Rainbow Children's Park",
    type: "pokemon",
    lat: 37.5447,
    lng: 127.0552,
    shortDescription:
      "성수동 카페거리 사이 작은 공원. 이브이 스탬프 획득.",
    fullDescription: `## 무지개어린이공원 — 이브이 스팟

성수동 카페거리 한가운데 있는 작은 공원. 서울숲 본권역에서 도보 15~20분 거리이며, **이브이 스탬프**를 받을 수 있습니다.

카페·디저트 코스와 묶어 가기 좋아 메가페스타 기간 동선상 사실상 필수 코스입니다.

- 일대 골목은 차량 통행이 있으니 어린이 동반 시 주의`,
    pokemonStamp: {
      pokemon: "이브이",
      eventEndDate: POKEMON_EVENT_END,
    },
    relatedSpotIds: ["pokemon-snorlax"],
  },
  {
    id: "pokemon-lapras",
    name: "수변광장 (라프라스 스팟)",
    nameEn: "Waterside Plaza",
    type: "pokemon",
    lat: 37.5462,
    lng: 127.0418,
    shortDescription:
      "서울숲 동편 한강 인근 수변 데크. 라프라스 스탬프 획득.",
    fullDescription: `## 수변광장 — 라프라스 스팟

서울숲 동편의 **수변 데크**. 한강 본류와 연결되어 시원한 강바람이 부는 곳입니다.

**라프라스 스탬프**는 데크 중앙 안내판 근처에서 받을 수 있어요. 일몰 시간대에는 강 너머 노을과 함께 인생 사진을 노릴 수 있는 보너스 포토 스팟이기도 합니다.

- 데크가 좁으니 단체 인증샷은 가급적 짧게`,
    pokemonStamp: {
      pokemon: "라프라스",
      eventEndDate: POKEMON_EVENT_END,
    },
    relatedSpotIds: ["wind-hill", "pokemon-snorlax"],
  },
  {
    id: "pokemon-vulpix",
    name: "은행나무길 북단 (식스테일 스팟)",
    nameEn: "Ginkgo Path North",
    type: "pokemon",
    lat: 37.5455,
    lng: 127.0388,
    shortDescription:
      "은행나무길 끝자락 작은 쉼터. 식스테일 스탬프 획득.",
    fullDescription: `## 은행나무길 북단 — 식스테일 스팟

은행나무길을 끝까지 따라가면 만나는 **작은 쉼터**. 벤치 2~3개와 안내판이 있고, **식스테일 스탬프**는 그 안내판에서 받을 수 있습니다.

가을 단풍 시즌엔 길 자체가 절경이라 이동 중에도 사진 컷이 자주 나옵니다. 시크릿 포레스트(잠만보)와 도보 5분 거리라 같이 묶기 좋아요.`,
    pokemonStamp: {
      pokemon: "식스테일",
      eventEndDate: POKEMON_EVENT_END,
    },
    relatedSpotIds: ["pokemon-snorlax", "ginkgo-path"],
  },
  {
    id: "pokemon-pikachu",
    name: "성수동 카페거리 입구 (피카츄 스팟)",
    nameEn: "Seongsu Cafe Street Entry",
    type: "pokemon",
    lat: 37.5443,
    lng: 127.0561,
    shortDescription:
      "성수역 ↔ 서울숲을 잇는 골목 초입. 피카츄 스탬프.",
    fullDescription: `## 성수동 카페거리 입구 — 피카츄 스팟

성수역 3번 출구에서 서울숲 방향으로 걷다 만나는 **카페거리 초입 광장**. **피카츄 스탬프**가 거리 입구 키오스크에서 발급됩니다.

주말 오후엔 가장 붐비는 구간 중 하나라 평일 또는 오전 방문을 추천합니다. 디저트·브런치 카페와 묶어 코스 짜기 편함.`,
    pokemonStamp: {
      pokemon: "피카츄",
      eventEndDate: POKEMON_EVENT_END,
    },
    relatedSpotIds: ["rainbow-eevee", "pokemon-ditto"],
  },
  {
    id: "pokemon-ditto",
    name: "언더스탠드애비뉴 (메타몽 스팟)",
    nameEn: "Understand Avenue",
    type: "pokemon",
    lat: 37.5443,
    lng: 127.0457,
    shortDescription:
      "컨테이너 복합문화공간. 메타몽 스탬프 획득.",
    fullDescription: `## 언더스탠드애비뉴 — 메타몽 스팟

서울숲 정문 옆 **컨테이너 박스 116개**로 만들어진 복합문화공간. 카페·핸드메이드 숍·전시가 모여 있어 짧게 둘러보기 좋습니다.

**메타몽 스탬프**는 안내 데스크(센터존)에서 받을 수 있어요. 운영 시간은 매장마다 다르니 11:00 이후가 안전합니다.`,
    pokemonStamp: {
      pokemon: "메타몽",
      eventEndDate: POKEMON_EVENT_END,
    },
    relatedSpotIds: ["pokemon-pikachu", "family-yard"],
  },
  {
    id: "garden-award-2026",
    name: "쇼가든 어워드 작품군",
    nameEn: "Show Garden Award Plots",
    type: "garden",
    lat: 37.5452,
    lng: 127.0395,
    shortDescription:
      "2026 서울국제정원박람회 수상 정원 6작품. 작가별 콘셉트 비교 추천.",
    fullDescription: `## 쇼가든 어워드 작품군

2026 서울국제정원박람회(**5/1 ~ 10/27**) 기간 한정으로 조성된 **6개 작가 정원**.

각 정원은 약 100㎡ 규모로, "회복", "공존", "기억" 등 작가별 주제를 표현합니다. 한 작품당 5~10분, 6개 전체 1시간 정도 동선이 적절합니다.

> 식재 식물은 일부 만지면 위험한 종도 있어요. 안내판의 ⚠ 표시 확인 필수.`,
    photoTips: {
      bestTime: "오전 10시 ~ 정오 (식물의 채도가 가장 살아나는 시간)",
      composition: "작품 안내판과 식재 디테일을 함께 한 프레임에",
    },
    relatedSpotIds: ["wind-hill", "ginkgo-path"],
  },
];
