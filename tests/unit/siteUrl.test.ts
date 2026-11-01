import { describe, it, expect } from 'vitest';
import { getPublicOrigin, createSafeUrl, PRODUCTION_SITE_URL } from '@/utils/siteUrl';
import { NextRequest } from 'next/server';

describe('siteUrl intelligence and public origin resolution', () => {
  it('resolves to production site URL when running in production environment', () => {
    const originalEnv = process.env.NODE_ENV;
    try {
      // @ts-expect-error mutating for test
      process.env.NODE_ENV = 'production';
      const origin = getPublicOrigin();
      expect(origin).toBe(PRODUCTION_SITE_URL);
    } finally {
      // @ts-expect-error restore
      process.env.NODE_ENV = originalEnv;
    }
  });

  it('resolves x-forwarded-host and x-forwarded-proto properly on Vercel deployment', () => {
    const req = new NextRequest('http://localhost:3000/en/auth/callback', {
      headers: {
        'x-forwarded-host': 'khabar-chakra.vercel.app',
        'x-forwarded-proto': 'https',
      },
    });

    const origin = getPublicOrigin(req);
    expect(origin).toBe('https://khabar-chakra.vercel.app');

    const safeUrl = createSafeUrl('/en/home', req);
    expect(safeUrl.toString()).toBe('https://khabar-chakra.vercel.app/en/home');
  });

  it('rejects internal localhost in production when x-forwarded-host contains localhost', () => {
    const originalEnv = process.env.NODE_ENV;
    try {
      // @ts-expect-error mutating for test
      process.env.NODE_ENV = 'production';
      const req = new NextRequest('http://localhost:3000/en/login', {
        headers: {
          'x-forwarded-host': 'localhost:3000',
        },
      });

      const origin = getPublicOrigin(req);
      expect(origin).toBe(PRODUCTION_SITE_URL);

      const safeUrl = createSafeUrl('/en/home', req);
      expect(safeUrl.toString()).toBe('https://khabar-chakra.vercel.app/en/home');
    } finally {
      // @ts-expect-error restore
      process.env.NODE_ENV = originalEnv;
    }
  });

  it('preserves localhost during local development', () => {
    const originalEnv = process.env.NODE_ENV;
    try {
      // @ts-expect-error mutating for test
      process.env.NODE_ENV = 'development';
      const req = new NextRequest('http://localhost:3000/en/home', {
        headers: {
          host: 'localhost:3000',
        },
      });

      const origin = getPublicOrigin(req);
      expect(origin).toBe('http://localhost:3000');

      const safeUrl = createSafeUrl('/en/home', req);
      expect(safeUrl.toString()).toBe('http://localhost:3000/en/home');
    } finally {
      // @ts-expect-error restore
      process.env.NODE_ENV = originalEnv;
    }
  });
});
