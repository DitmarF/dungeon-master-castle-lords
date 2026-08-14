import type { Metadata, Viewport } from "next";
import "./globals.css";

const themeBootScript = `
  try {
    var storedTheme = localStorage.getItem("dmcl.prototype.theme.v1");
    var dark = storedTheme === "dark" ||
      (storedTheme !== "light" && matchMedia("(prefers-color-scheme: dark)").matches);
    var theme = dark ? "dark" : "light";
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
  } catch (_) {}
`;

export const metadata: Metadata = {
  title: "Dungeon Master & Castle Lords",
  description:
    "A modular 2D dungeon management and tactical board-game prototype.",
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  colorScheme: "light dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
