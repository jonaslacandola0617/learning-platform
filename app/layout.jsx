import "../src/App.css";
import { siteUrl } from "../src/site";

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Tuklas | Learn through every game",
    template: "%s | Tuklas",
  },
  description: "Isang masayang Filipino learning platform na may interactive educational games para sa bawat aralin.",
  applicationName: "Tuklas Learning Platform",
  keywords: ["learning platform", "educational games", "Filipino", "GMRC", "Hula ang Salita"],
  openGraph: {
    title: "Tuklas Learning Platform",
    description: "Learn, play, and grow through interactive educational games with editable, topic-based lessons.",
    type: "website",
    locale: "fil_PH",
  },
  icons: { icon: "/favicon.svg" },
};

export const viewport = {
  themeColor: "#1559b7",
  colorScheme: "light",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fil">
      <body>{children}</body>
    </html>
  );
}
