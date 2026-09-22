import type { MetadataRoute } from "next";
import { SIGN_SLUGS, allDaySlugs } from "@/lib/slugs";
import { SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: SITE_URL, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/qual-e-o-meu-signo`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/quiz`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/famosos`, lastModified: now, changeFrequency: "daily", priority: 0.7 },
    ...Object.values(SIGN_SLUGS).map((slug) => ({
      url: `${SITE_URL}/famosos/${slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...Object.values(SIGN_SLUGS).map((slug) => ({
      url: `${SITE_URL}/quiz/resultado/${slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.4,
    })),
    ...Object.values(SIGN_SLUGS).map((slug) => ({
      url: `${SITE_URL}/signo/${slug}`,
      lastModified: now,
      changeFrequency: "daily" as const,
      priority: 0.9,
    })),
    ...allDaySlugs().map((dia) => ({
      url: `${SITE_URL}/signo-de/${dia}`,
      changeFrequency: "yearly" as const,
      priority: 0.5,
    })),
  ];
}
