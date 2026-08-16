import "../src/App.css";
import "../src/FullscreenMode.css";
import "../src/DrawingWorkspace.css";
import { FullscreenMode } from "../src/FullscreenMode";
import { siteUrl } from "../src/site";

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Tuklas | Learn through every game",
    template: "%s | Tuklas",
  },
  description: "A playful learning platform with editable, topic-based educational games.",
  applicationName: "Tuklas Learning Platform",
  keywords: ["learning platform", "educational games", "vocabulary game", "word games", "Tuklas"],
  openGraph: {
    title: "Tuklas Learning Platform",
    description: "Learn, play, and grow through interactive educational games with editable, topic-based lessons.",
    type: "website",
    locale: "en_PH",
  },
  icons: {
    icon: [{ url: "/tuklas-logo.svg", type: "image/svg+xml" }],
    shortcut: "/tuklas-logo.svg",
    apple: "/tuklas-logo.svg",
  },
};

export const viewport = {
  themeColor: "#1559b7",
  colorScheme: "light",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en-PH" style={{ colorScheme: "light" }}>
      <body><FullscreenMode>{children}</FullscreenMode></body>
    </html>
  );
}
