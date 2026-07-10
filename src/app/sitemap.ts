import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: "https://houlinzhi.com", lastModified: now, changeFrequency: "monthly", priority: 1 },
    { url: "https://houlinzhi.com/workspace", lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: "https://houlinzhi.com/arknights", lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: "https://houlinzhi.com/arknights/headhunting", lastModified: now, changeFrequency: "monthly", priority: 0.6 },
  ];
}
