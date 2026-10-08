import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://khabar-chakra.vercel.app';
  const now = new Date();

  const publicRoutes = [
    '',
    '/en',
    '/en/available',
    '/en/help',
    '/en/faq',
    '/en/contact',
    '/en/team',
    '/en/legal/terms',
    '/en/legal/privacy',
    '/en/legal/food-safety',
    '/en/legal/guidelines',
  ];

  return publicRoutes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: route === '' || route === '/en' ? 1.0 : 0.7,
  }));
}
