import type { Metadata, Viewport } from "next";
import "./globals.css";

import { GlobalProviders } from "@/common/providers/GlobalProviders";
import { THEME_BG_DARK_MODE, THEME_LOCAL_STORAGE_KEY, THEME_VALUE } from "@/common/types/theme";


export const metadata: Metadata = {
  title: {
    default: '위블 | withBloo',
    template: '%s - 위블',
  },
  description: "어떤 하루든, 모두 나의 기록으로. 오늘의 감정과 작은 습관을 기록하고 달력과 통계로 돌아보세요.",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: '/favicon.png', sizes: '32x32', type: 'image/png' },
      { url: '/icon/icon-48x48.png', sizes: '48x48', type: 'image/png' },
    ],
    apple: { url: '/icon/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
  },
};

export const viewport: Viewport = {
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  width: 'device-width',
  interactiveWidget: 'resizes-content'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  const localThemeInitScript = `
    (function () {
      try {
        var storedValue = window.localStorage.getItem(${JSON.stringify(THEME_LOCAL_STORAGE_KEY)});
        var preference = storedValue ? JSON.parse(storedValue) : null;
        var themeValues = ${JSON.stringify(THEME_VALUE)};
        var themeName = preference && themeValues[preference.theme]
          ? preference.theme
          : 'blue';
        var accent = themeValues[themeName];
        var isDarkMode = preference && preference.mode === '어둡게';
        var accentLight = isDarkMode
          ? '${THEME_BG_DARK_MODE}'
          : accent.accentLight;
        var themeColor = 'rgb(' + accentLight + ')';

        document.documentElement.dataset.themeAccent = themeName;
        document.documentElement.dataset.themeMode = isDarkMode ? '어둡게' : '밝게';
        document.documentElement.style.setProperty('--loading-background', themeColor);
        document.documentElement.style.setProperty('--loading-indicator', 'rgb(' + accent.accent + ')');

        var isFixedLightPage = ['/', '/login', '/intro', '/privacy', '/account-deletion'].includes(location.pathname);
        var statusBarColor = isFixedLightPage ? 'rgb(240 247 255)' : themeColor;
        var metaThemeColor = document.getElementById('theme-color');
        if (metaThemeColor) metaThemeColor.setAttribute('content', statusBarColor);

        if (window.ReactNativeWebView) {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'THEME_CHANGE',
            color: statusBarColor,
            style: isDarkMode && !isFixedLightPage ? 'light' : 'dark'
          }));
        }
      } catch (error) {
        document.documentElement.style.setProperty('--loading-background', 'rgb(240 247 255)');
        document.documentElement.style.setProperty('--loading-indicator', 'rgb(140 173 226)');
      }
    })();
  `;

  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <meta id="theme-color" name="theme-color" content="#F0F7FF" />
        <link rel="preload" href="/fonts/Fredoka[wdth,wght].ttf" as="font" type="font/ttf" crossOrigin="anonymous" />
        <script dangerouslySetInnerHTML={{ __html: localThemeInitScript }} />
        <meta name="google-site-verification" content="MSSWdnca2PMfsNV3MPmssa5cjQqycFJmdrj04DFx5fU" />

        <meta name="mobile-web-app-capable" content="yes" />

        <meta property="og:title" content="위블 - 감정 일기와 습관 관리" />
        <meta property="og:description" content="어떤 하루든, 모두 나의 기록으로. 오늘의 감정과 작은 습관을 기록하고 달력과 통계로 돌아보세요." />
        <meta property="og:image" content={process.env.OG_IMAGE_URL || 'https://to-ok.me/icon/icon-512x512.png'} />
      </head>

      <body>
        <GlobalProviders>
          {children}
        </GlobalProviders>
      </body>
    </html>
  );
}
