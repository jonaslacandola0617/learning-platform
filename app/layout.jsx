import "../src/App.css";
import { siteUrl } from "../src/site";

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Tuklas | Matuto sa bawat laro",
    template: "%s | Tuklas",
  },
  description: "Isang masayang Filipino learning platform na may interactive educational games para sa bawat aralin.",
  applicationName: "Tuklas Learning Platform",
  keywords: ["learning platform", "educational games", "Filipino", "GMRC", "Hula ang Salita"],
  openGraph: {
    title: "Tuklas Learning Platform",
    description: "Matuto, maglaro, at umunlad sa interactive Filipino educational games.",
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
