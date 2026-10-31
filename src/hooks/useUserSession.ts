'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import type { User } from '@supabase/supabase-js';

export function useUserSession() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    // Fetch initial session
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const displayName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    (user?.email ? user.email.split('@')[0] : '');

  const avatarUrl = user?.user_metadata?.avatar_url || null;

  const initials = displayName
    ? displayName
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'KC';

  const signOut = async (locale: string = 'en') => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut({ scope: 'global' });
    } catch (e) {
      console.error('Client signOut error:', e);
    }

    try {
      await fetch('/api/auth/signout', { method: 'POST' });
    } catch {
      // Ignore
    }

    if (typeof window !== 'undefined') {
      try {
        const keysToRemove: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && (key.startsWith('sb-') || key.includes('supabase') || key.includes('auth-token'))) {
            keysToRemove.push(key);
          }
        }
        keysToRemove.forEach((k) => localStorage.removeItem(k));
      } catch {
        // Ignore
      }

      try {
        document.cookie.split(';').forEach((c) => {
          const eqPos = c.indexOf('=');
          const name = eqPos > -1 ? c.substring(0, eqPos).trim() : c.trim();
          if (name.startsWith('sb-') || name.includes('supabase') || name.includes('auth-token')) {
            document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; max-age=0`;
          }
        });
      } catch {
        // Ignore
      }

      window.location.href = `/${locale}/login?logout=true`;
    }
  };

  return {
    user,
    loading,
    displayName,
    avatarUrl,
    initials,
    isLoggedIn: !!user,
    signOut,
  };
}
