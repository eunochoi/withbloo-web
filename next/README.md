#### Next.js App Router

```text
next/src/app/
├── (api)/api/auth/
├── (error)/unauthorized/
└── (routes)/
    ├── (auth)/                # / and /login share LoginClientPage
    ├── (static)/              # /intro, /privacy, /account-deletion
    └── (app)/
        ├── layout.tsx              # children + @panel slot
        ├── @panel/                 # client navigation overlays
        │   ├── default.tsx
        │   ├── [...catchAll]/page.tsx
        │   ├── (.)diary/           # new, [diaryId], [diaryId]/edit
        │   └── (.)habit/           # new, order, [habitId], [habitId]/edit
        ├── home/, calendar/, setting/
        ├── diary/                  # list, new, [diaryId], [diaryId]/edit
        │   └── _entries/          # shared server prefetch and hydration
        └── habit/                  # list, new, order, [habitId], [habitId]/edit
            └── _entries/
```

각 `page.tsx`는 Server Component입니다. 화면의 클라이언트 상태와 동작은 `*ClientPage.tsx`에 둡니다. 일기와 습관의 일반 route 및 intercepted route는 동일한 `_entries` 서버 컴포넌트를 사용합니다. Panel은 URL과 브라우저 기록을 사용하며, Picker는 로컬 상태로 열고 닫습니다.

로그인 화면은 `/`와 `/login`에서 공유합니다. PWA는 `/login`에서 시작하고, 소개 화면은 `/intro`에서 엽니다.
