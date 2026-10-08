'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function AvailableRedirectPage() {
  const router = useRouter();
  const params = useParams();
  const locale = params?.locale || 'en';

  useEffect(() => {
    // Redirect obsolete public surplus feed to private household "Use This First" urgency shelf
    router.replace(`/${locale}/inventory`);
  }, [router, locale]);

  return (
    <div className="min-h-[50vh] flex items-center justify-center p-6 text-center">
      <div className="space-y-3">
        <div className="text-3xl animate-bounce">⚡</div>
        <h1 className="text-lg font-bold text-[var(--kc-ink)]">
          Redirecting to &ldquo;Use This First&rdquo; Priority Shelf...
        </h1>
        <p className="text-xs text-[var(--kc-muted)]">
          All food tracking in Khabar Chakra is strictly private to your household kitchen.
        </p>
      </div>
    </div>
  );
}
