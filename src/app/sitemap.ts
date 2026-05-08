import type { MetadataRoute } from "next";

import { DEFAULT_PRICE_ESTIMATES } from "@/lib/constants";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/`,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/triagem`,
      changeFrequency: "daily",
      priority: 0.9,
    },
  ];

  const dynamicRoutes = DEFAULT_PRICE_ESTIMATES.map((item) => ({
    url: `${baseUrl}/${item.especialidadeSlug}/${item.procedimentoSlug}/${item.cidadeSlug}`,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [...staticRoutes, ...dynamicRoutes];
}
