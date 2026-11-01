export const SOBER_NAME_MAX_LENGTH = 30;

export const SOBER_ICONS = {
  "favorite": "기본 1",
  "moon": "야식",
  "food": "간식",
  "coffee": "커피",
  "soda": "음료",
  "dessert": "디저트",
  "smoking": "흡연",
  "alcohol": "음주",
  "shopping": "쇼핑",
  "delivery": "배달",
  "phone": "휴대폰",
  "social": "SNS",
  "video": "영상",
  "game": "게임",
  "gambling": "도박",
  "oversleep": "과수면",
  "lateSleep": "늦은 취침",
  "procrastination": "미루기",
  "anger": "화내기",
  "age19": "19",
  "carbonatedDrinks": "탄산음료",
  "overeating": "과식",
  "sweets": "단 음식",
  "energyDrinks": "에너지 음료",
  "noodles": "라면",
  "fastFood": "패스트푸드",
  "friedFood": "튀김",
  "processedFood": "가공식품",
  "saltyFood": "짠 음식",
  "spicyFood": "매운 음식",
  "impulseBuying": "충동구매",
  "subscriptions": "구독 결제",
  "gamePurchases": "게임 과금",
  "dayTrading": "단타 매매",
  "cryptoTrading": "코인 거래",
  "shortVideos": "숏폼",
  "bingeWatching": "정주행",
  "webBrowsing": "웹서핑",
  "newsChecking": "뉴스 확인",
  "communities": "커뮤니티",
  "notificationChecking": "알림 확인",
  "lateWork": "늦은 업무",
  "overworking": "과도한 업무",
  "prolongedSitting": "오래 앉기",
  "nailBiting": "손톱 물기",
  "skinPicking": "피부 뜯기",
  "swearing": "욕설",
  "gossip": "험담",
  "complaining": "불평",
  "comparison": "타인 비교",
  "shield": "기본 2",
  "pause": "기본 3",
  "leaf": "기본 4",
  "anchor": "기본 5"
} as const;
export type SoberIconKey = keyof typeof SOBER_ICONS;
export const MAX_SOBER_COUNT = 10;

export const SOBER_ICON_CATEGORIES = [
  {
    "id": "basic",
    "label": "기본",
    "description": "나에게 필요한 거리두기를\n자유롭게 정해요.",
    "keys": [
      "favorite",
      "shield",
      "pause",
      "leaf",
      "anchor"
    ]
  },
  {
    "id": "screen",
    "label": "화면과 콘텐츠",
    "description": "잠시 화면을 내려놓고\n나의 시간을 챙겨요.",
    "keys": [
      "phone",
      "social",
      "video",
      "game",
      "shortVideos",
      "bingeWatching",
      "webBrowsing",
      "newsChecking",
      "communities",
      "notificationChecking"
    ]
  },
  {
    "id": "food",
    "label": "음식과 음료",
    "description": "먹는 즐거움을 지키며\n나에게 맞는 양을 찾아요.",
    "keys": [
      "moon",
      "food",
      "dessert",
      "delivery",
      "overeating",
      "sweets",
      "noodles",
      "fastFood",
      "friedFood",
      "processedFood",
      "saltyFood",
      "spicyFood",
      "coffee",
      "soda",
      "carbonatedDrinks",
      "energyDrinks"
    ]
  },
  {
    "id": "spending",
    "label": "소비와 금전",
    "description": "바로 결정하지 않아도 돼요.\n선택할 여유를 가져요.",
    "keys": [
      "shopping",
      "gambling",
      "impulseBuying",
      "subscriptions",
      "gamePurchases",
      "dayTrading",
      "cryptoTrading"
    ]
  },
  {
    "id": "routine",
    "label": "생활 패턴",
    "description": "익숙한 생활도 작은 선택부터\n바꿔갈 수 있어요.",
    "keys": [
      "oversleep",
      "lateSleep",
      "procrastination",
      "lateWork",
      "overworking",
      "prolongedSitting",
      "nailBiting",
      "skinPicking"
    ]
  },
  {
    "id": "relationships",
    "label": "마음과 관계",
    "description": "감정은 자연스러워요.\n반응은 천천히 골라도 돼요.",
    "keys": [
      "anger",
      "swearing",
      "gossip",
      "complaining",
      "comparison"
    ]
  },
  {
    "id": "adult",
    "label": "19+",
    "description": "술·담배·성인 콘텐츠와\n나에게 맞는 거리를 정해요.",
    "keys": [
      "smoking",
      "alcohol",
      "age19"
    ]
  }
] as const;
