import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://khabar-chakra.vercel.app';

  return {
    rules: {
      userAgent: '*',
      allow: ['/', '/en', '/en/available', '/en/help', '/en/faq', '/en/contact', '/en/team', '/en/legal/*'],
      disallow: ['/api/*', '/*/admin*', '/*/settings*', '/*/welcome*', '/*/profile*'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
