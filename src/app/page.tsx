import { redirect } from 'next/navigation';

interface RootPageProps {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function RootPage({ searchParams }: RootPageProps) {
  const params = await searchParams;
  const sp = new URLSearchParams();
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (typeof value === 'string') {
        sp.set(key, value);
      } else if (Array.isArray(value)) {
        value.forEach((v) => sp.append(key, v));
      }
    }
  }

  const query = sp.toString();
  // If an OAuth authorization code landed on the root page, forward it to the callback exchange route
  if (params?.code) {
    redirect(`/auth/callback${query ? `?${query}` : ''}`);
  }

  redirect(`/en${query ? `?${query}` : ''}`);
}
