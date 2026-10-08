'use client';

import React, { useEffect, useRef, useState } from 'react';

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: string | HTMLElement,
        options: {
          sitekey: string;
          callback?: (token: string) => void;
          'error-callback'?: () => void;
          'expired-callback'?: () => void;
          theme?: 'light' | 'dark' | 'auto';
        }
      ) => string;
      reset: (widgetId: string) => void;
    };
  }
}

interface TurnstileWidgetProps {
  onSuccess: (token: string) => void;
  onError?: () => void;
  onExpire?: () => void;
}

export function TurnstileWidget({ onSuccess, onError, onExpire }: TurnstileWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const rawSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  // Check if site key is valid (Cloudflare keys usually start with '0x4' or test key '1x0'/'2x0'/'3x0')
  const isValidSiteKey =
    rawSiteKey &&
    !rawSiteKey.startsWith('eyJ') && // Not a JWT
    rawSiteKey.length > 5;

  useEffect(() => {
    if (!isValidSiteKey) {
      // If site key not configured yet or invalid JWT, inform form as bypass
      onSuccess('turnstile_dev_bypass');
      return;
    }

    // Load Turnstile script if not already present
    if (!document.getElementById('cf-turnstile-script')) {
      const script = document.createElement('script');
      script.id = 'cf-turnstile-script';
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
      script.async = true;
      script.defer = true;
      script.onload = () => setIsLoaded(true);
      document.head.appendChild(script);
    } else if (window.turnstile) {
      setIsLoaded(true);
    }
  }, [isValidSiteKey, onSuccess]);

  useEffect(() => {
    if (!isLoaded || !containerRef.current || !window.turnstile || !isValidSiteKey) return;

    if (!widgetIdRef.current) {
      try {
        const id = window.turnstile.render(containerRef.current, {
          sitekey: rawSiteKey!,
          callback: (token: string) => onSuccess(token),
          'error-callback': () => onError?.(),
          'expired-callback': () => onExpire?.(),
          theme: 'light',
        });
        widgetIdRef.current = id;
      } catch (err) {
        console.warn('Turnstile rendering notice:', err);
      }
    }

    return () => {
      // Cleanup widget if needed
    };
  }, [isLoaded, isValidSiteKey, rawSiteKey, onSuccess, onError, onExpire]);

  if (!isValidSiteKey) {
    return (
      <div className="text-[10px] font-mono text-[var(--kc-muted)] bg-[var(--kc-mint)] p-2 rounded-sm border border-[var(--kc-hairline)]">
        ✦ Turnstile Bot Protection: Development test mode active.
      </div>
    );
  }

  return (
    <div className="my-2">
      <div ref={containerRef} className="cf-turnstile" />
    </div>
  );
}
