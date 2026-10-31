'use client';

import React from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <head>
        <title>System Notice · Khabar Chakra</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body
        style={{
          margin: 0,
          padding: 0,
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#071F17',
          color: '#F4FBF7',
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
          boxSizing: 'border-box',
        }}
      >
        <div
          style={{
            maxWidth: '540px',
            width: '90%',
            margin: '2rem auto',
            padding: '2.5rem 2rem',
            backgroundColor: '#0D2B20',
            border: '1px solid #1E5C45',
            borderRadius: '1.25rem',
            textAlign: 'center',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              margin: '0 auto 1.5rem',
              borderRadius: '50%',
              backgroundColor: '#164835',
              border: '2px solid #2EB286',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '28px',
            }}
          >
            🌿
          </div>

          <span
            style={{
              fontSize: '11px',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: '#5BD7A7',
              fontWeight: 700,
              fontFamily: 'monospace',
              display: 'block',
              marginBottom: '0.5rem',
            }}
          >
            Khabar Chakra · Domestic Ledger
          </span>

          <h1
            style={{
              fontSize: '26px',
              fontWeight: 800,
              margin: '0 0 1rem',
              color: '#FFFFFF',
              letterSpacing: '-0.02em',
            }}
          >
            Kitchen System Interruption
          </h1>

          <p
            style={{
              fontSize: '14px',
              lineHeight: '1.6',
              color: '#A8D5C2',
              margin: '0 0 1.75rem',
            }}
          >
            A temporary disruption halted this kitchen dispatch. No domestic inventory records or ₹
            savings data were harmed.
          </p>

          {error?.digest && (
            <div
              style={{
                padding: '0.5rem 0.75rem',
                marginBottom: '1.75rem',
                backgroundColor: '#071F17',
                border: '1px dashed #1E5C45',
                borderRadius: '0.5rem',
                fontSize: '11px',
                fontFamily: 'monospace',
                color: '#7FBFA3',
                wordBreak: 'break-all',
              }}
            >
              Incident Digest: {error.digest}
            </div>
          )}

          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.75rem',
              justifyContent: 'center',
            }}
          >
            <button
              type="button"
              onClick={() => reset()}
              style={{
                padding: '0.75rem 1.5rem',
                fontSize: '13px',
                fontWeight: 700,
                color: '#071F17',
                backgroundColor: '#FFC93C',
                border: 'none',
                borderRadius: '9999px',
                cursor: 'pointer',
                transition: 'transform 0.15s ease',
              }}
            >
              Restart Session ↻
            </button>
            <a
              href="/en/home"
              style={{
                padding: '0.75rem 1.5rem',
                fontSize: '13px',
                fontWeight: 700,
                color: '#FFFFFF',
                backgroundColor: '#1E5C45',
                border: '1px solid #2EB286',
                borderRadius: '9999px',
                textDecoration: 'none',
                display: 'inline-block',
              }}
            >
              Kitchen Home →
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
