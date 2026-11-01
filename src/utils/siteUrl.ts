import { NextRequest } from 'next/server';

export const PRODUCTION_SITE_URL = 'https://khabar-chakra.vercel.app';

/**
 * Derives the true public origin for the current request.
 * Handles reverse proxies, Vercel edge/lambda forwards, and prevents
 * accidental redirection to internal host/localhost in production environments.
 */
export function getPublicOrigin(request?: NextRequest | Request): string {
  // If running in browser:
  if (typeof window !== 'undefined' && window.location) {
    const browserOrigin = window.location.origin;
    if (browserOrigin && !browserOrigin.includes('localhost') && !browserOrigin.includes('127.0.0.1')) {
      return browserOrigin;
    }
    if (process.env.NODE_ENV === 'production') {
      return process.env.NEXT_PUBLIC_SITE_URL || PRODUCTION_SITE_URL;
    }
    return browserOrigin || 'http://localhost:3000';
  }

  // If server-side with request headers:
  if (request) {
    const headers = request.headers;
    const forwardedHost = headers.get('x-forwarded-host');
    const forwardedProto = headers.get('x-forwarded-proto');

    if (forwardedHost) {
      const isLocalHost = forwardedHost.includes('localhost') || forwardedHost.includes('127.0.0.1');
      if (isLocalHost && process.env.NODE_ENV === 'production') {
        return process.env.NEXT_PUBLIC_SITE_URL || PRODUCTION_SITE_URL;
      }
      const proto = forwardedProto || (isLocalHost ? 'http' : 'https');
      return `${proto}://${forwardedHost}`;
    }

    const host = headers.get('host');
    if (host) {
      const isLocalHost = host.includes('localhost') || host.includes('127.0.0.1');
      if (isLocalHost && process.env.NODE_ENV === 'production') {
        return process.env.NEXT_PUBLIC_SITE_URL || PRODUCTION_SITE_URL;
      }
      const proto = forwardedProto || (isLocalHost ? 'http' : 'https');
      return `${proto}://${host}`;
    }
  }

  // Fallback using environment or default
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, '');
  }

  if (process.env.NODE_ENV === 'production' || process.env.VERCEL) {
    return PRODUCTION_SITE_URL;
  }

  return 'http://localhost:3000';
}

/**
 * Creates a safe absolute URL based on the public origin.
 */
export function createSafeUrl(path: string, request?: NextRequest | Request): URL {
  const origin = getPublicOrigin(request);
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return new URL(cleanPath, origin);
}
