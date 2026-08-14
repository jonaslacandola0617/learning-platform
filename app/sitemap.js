import { siteUrl } from "../src/site";

export default function sitemap() {
  return [{ url: siteUrl, lastModified: new Date(), changeFrequency: "weekly", priority: 1 }];
}
