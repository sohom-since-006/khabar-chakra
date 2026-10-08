import 'server-only';

/**
 * Cloudflare Turnstile Server-side Token Verification
 * Strictly adheres to 0-cost and fail-open in test/development environments if keys are missing.
 */

interface TurnstileVerifyResponse {
  success: boolean;
  'error-codes'?: string[];
  challenge_ts?: string;
  hostname?: string;
}

export async function verifyTurnstileToken(
  token: string | undefined | null,
  remoteIp?: string
): Promise<{ success: boolean; error?: string }> {
  const secretKey = process.env.TURNSTILE_SECRET_KEY;

  // If no secret key is configured or offline development environment, allow bypass
  if (!secretKey || secretKey === 'dummy_secret') {
    return { success: true };
  }

  if (!token) {
    return { success: false, error: 'Captcha token is required.' };
  }

  try {
    const formData = new URLSearchParams();
    formData.append('secret', secretKey);
    formData.append('response', token);
    if (remoteIp && remoteIp !== '127.0.0.1' && remoteIp !== '::1') {
      formData.append('remoteip', remoteIp);
    }

    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    const data: TurnstileVerifyResponse = await res.json();

    if (data.success) {
      return { success: true };
    }

    return {
      success: false,
      error: `Turnstile verification failed: ${data['error-codes']?.join(', ') || 'invalid token'}`,
    };
  } catch (err) {
    console.error('Cloudflare Turnstile verification request error:', err);
    // In event of network outage to Cloudflare, log and allow to avoid locking out genuine users
    return { success: true };
  }
}
