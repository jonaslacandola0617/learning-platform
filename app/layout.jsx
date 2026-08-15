import "../src/App.css";
import "../src/KidMode.css";
import { KidMode } from "../src/KidMode";
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
  icons: { icon: "/favicon.svg" },
};

export const viewport = {
  themeColor: "#1559b7",
  colorScheme: "light",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en-PH" style={{ colorScheme: "light" }}>
      <body><KidMode>{children}</KidMode></body>
    </html>
  );
}
