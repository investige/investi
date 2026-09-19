import type { MetadataRoute } from "next";

const SITE_URL = "https://investi.ge";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/profile", "/reset-password", "/auth"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
