'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function OrganisationRedirectPage() {
  const router = useRouter();
  const params = useParams();
  const locale = params?.locale || 'en';

  useEffect(() => {
    // Under the household pivot, external organisation registrations are omitted
    router.replace(`/${locale}/home`);
  }, [router, locale]);

  return (
    <div className="min-h-[50vh] flex items-center justify-center p-6 text-center">
      <div className="space-y-3">
        <div className="text-3xl animate-bounce">🏠</div>
        <h1 className="text-lg font-bold text-[var(--kc-ink)]">
          Redirecting to Kitchen Dashboard...
        </h1>
        <p className="text-xs text-[var(--kc-muted)]">
          Khabar Chakra is 100% focused on household kitchen intelligence and zero food waste.
        </p>
      </div>
    </div>
  );
}
