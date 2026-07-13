import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://houlinzhi.com";
  const now = new Date();

  const pages: MetadataRoute.Sitemap = [
    { url: base, lastModified: now, changeFrequency: "monthly", priority: 1 },
    { url: `${base}/workspace`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/workspace/color-converter`, lastModified: now, changeFrequency: "yearly", priority: 0.5 },
    { url: `${base}/workspace/diagram`, lastModified: now, changeFrequency: "yearly", priority: 0.5 },
    { url: `${base}/workspace/hash-generator`, lastModified: now, changeFrequency: "yearly", priority: 0.5 },
    { url: `${base}/workspace/json-formatter`, lastModified: now, changeFrequency: "yearly", priority: 0.5 },
    { url: `${base}/workspace/pomodoro`, lastModified: now, changeFrequency: "yearly", priority: 0.5 },
    { url: `${base}/workspace/qr-generator`, lastModified: now, changeFrequency: "yearly", priority: 0.5 },
    { url: `${base}/workspace/base64`, lastModified: now, changeFrequency: "yearly", priority: 0.5 },
    { url: `${base}/workspace/uuid`, lastModified: now, changeFrequency: "yearly", priority: 0.5 },
    { url: `${base}/workspace/timestamp`, lastModified: now, changeFrequency: "yearly", priority: 0.5 },
    { url: `${base}/workspace/regex`, lastModified: now, changeFrequency: "yearly", priority: 0.5 },
    { url: `${base}/workspace/password`, lastModified: now, changeFrequency: "yearly", priority: 0.5 },
    { url: `${base}/workspace/url-encode`, lastModified: now, changeFrequency: "yearly", priority: 0.5 },
    { url: `${base}/workspace/text-stats`, lastModified: now, changeFrequency: "yearly", priority: 0.5 },
    { url: `${base}/arknights`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/arknights/headhunting`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
  ];

  return pages;
}
