import React from 'react';
import { notFound } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';

export const dynamic = 'force-dynamic';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
  // Decision D10: Everyone except server-verified admins receives standard 404
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    // In development mode, allow temporary debug param or check DB
    const isDev = process.env.NODE_ENV === 'development';

    if (authError || !user) {
      if (!isDev) {
        notFound();
      }
    } else {
      // Check admin_users table in Supabase
      const { data: adminUser } = await supabase
        .from('admin_users')
        .select('user_id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!adminUser && !isDev) {
        notFound();
      }
    }
  } catch {
    // If DB check fails or in production without credentials, render 404
    if (process.env.NODE_ENV !== 'development') {
      notFound();
    }
  }

  return <>{children}</>;
}
