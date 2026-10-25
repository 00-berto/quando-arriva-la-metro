import type { MetadataRoute } from "next";
import { SITE_URL } from "@/app/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: SITE_URL.toString(),
      priority: 1,
    },
  ];
}
