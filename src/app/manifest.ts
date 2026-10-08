import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Khabar Chakra (খাবার চক্র) · Kitchen Almanac',
    short_name: 'Khabar Chakra',
    description: 'Domestic kitchen food-lifecycle platform: track freshness, prevent duplicates, handle waste responsibly.',
    start_url: '/en',
    display: 'standalone',
    background_color: '#FAFDF6',
    theme_color: '#0B6E3C',
    lang: 'en',
    orientation: 'portrait-primary',
    icons: [
      {
        src: '/icons/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-maskable-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}
