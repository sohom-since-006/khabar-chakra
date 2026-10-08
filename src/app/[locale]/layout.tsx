import React from 'react';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { LiveDynamicBackground } from '@/components/ui/LiveDynamicBackground';
import { CustomCursor } from '@/components/ui/CustomCursor';
import { MobileBottomNav } from '@/components/layout/MobileBottomNav';

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  const { locale } = await params;
  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages} locale={locale}>
      <div className="flex flex-col min-h-screen relative overflow-x-hidden bg-[var(--kc-bg)] text-[var(--kc-ink)] transition-colors duration-300">
        <CustomCursor />
        <LiveDynamicBackground />
        <Header locale={locale} />
        <div className="flex-1 relative z-10 pb-20 xl:pb-0">
          {children}
        </div>
        <Footer locale={locale} />
        <MobileBottomNav locale={locale} />
      </div>
    </NextIntlClientProvider>
  );
}
