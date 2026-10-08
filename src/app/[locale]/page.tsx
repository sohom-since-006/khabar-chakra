import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import { AlmanacStillLife } from '@/components/landing/AlmanacStillLife';
import { KhabarIcon } from '@/components/ui/KhabarIcon';

interface LandingPageProps {
  params: Promise<{ locale: string }>;
}

export default async function LandingPage({ params }: LandingPageProps) {
  const { locale } = await params;
  const t = await getTranslations('landing');
  const tc = await getTranslations('common');

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Magazine Cover Masthead */}
      <div className="almanac-rule pb-6 mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <div className="flex items-center gap-3">
              <span className="almanac-num">EST. 2026 · ASANSOL</span>
              <span className="almanac-stamp">SURPLUS ALMANAC</span>
            </div>
            <div className="flex items-center gap-4 mt-2">
              <Image
                src="/branding/app-logo.png"
                alt="Khabar Chakra Official Mark"
                width={64}
                height={64}
                className="rounded-sm object-contain border border-[var(--kc-hairline)] bg-white p-1 hidden sm:block"
                priority
              />
              <div>
                <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-[var(--kc-ink)]">
                  {t('masthead')}
                </h1>
                <p className="text-base sm:text-lg text-[var(--kc-muted)] mt-1 font-serif italic">
                  {tc('siteNameBengali')} · A community food-lifecycle gazette for homes, caterers & NGOs
                </p>
              </div>
            </div>
          </div>
          <div className="text-right hidden sm:block">
            <div className="font-mono text-xs text-[var(--kc-muted)]">{t('issueNo')}</div>
            <div className="font-annotation text-lg text-[var(--kc-basil)] mt-0.5">
              &ldquo;Track freshness. Share with dignity.&rdquo;
            </div>
          </div>
        </div>
      </div>

      {/* Hero Cover Grid: Asymmetric 2-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-16">
        {/* Left Editorial Text Column (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="border-l-2 border-[var(--kc-basil)] pl-4">
            <span className="almanac-num block">PROCLAMATION NO. 01</span>
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-[var(--kc-ink)] mt-1 leading-snug">
              {t('heroTitle')}
            </h2>
          </div>

          <p className="text-base sm:text-lg text-[var(--kc-muted)] leading-relaxed">
            {t('heroSubtitle')} Every domestic kitchen and banquet hall has moments of surplus. Our mission is to bridge the final hours with dignity, verified security, and absolute transparency.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link
              href={`/${locale}/signup`}
              className="px-6 py-3 bg-[var(--kc-basil)] text-white font-semibold text-sm rounded-sm hover:opacity-90 transition-opacity flex items-center gap-2"
            >
              <KhabarIcon name="track" size={18} className="text-white" />
              <span>{t('ctaJoin')}</span>
            </Link>
            <Link
              href={`/${locale}/available`}
              className="px-6 py-3 border border-[var(--kc-hairline)] bg-[var(--kc-card)] text-[var(--kc-ink)] font-semibold text-sm rounded-sm hover:bg-[var(--kc-mint)] transition-colors flex items-center gap-2"
            >
              <KhabarIcon name="map" size={18} />
              <span>{t('ctaExplore')}</span>
            </Link>
          </div>

          {/* Quick Stats Ruled Ledger Bar */}
          <div className="pt-6 almanac-rule-top grid grid-cols-3 gap-4 text-left">
            <div>
              <div className="text-2xl sm:text-3xl font-black text-[var(--kc-ink)] font-mono">48h</div>
              <div className="text-[11px] text-[var(--kc-muted)] font-mono uppercase">Max Live Window</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-[var(--kc-basil)] font-mono">₹0</div>
              <div className="text-[11px] text-[var(--kc-muted)] font-mono uppercase">Non-Profit Cost</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-[var(--kc-chilli)] font-mono">0%</div>
              <div className="text-[11px] text-[var(--kc-muted)] font-mono uppercase">Raw Meat Allowed</div>
            </div>
          </div>
        </div>

        {/* Right Product Still Life Column (5 cols) */}
        <div className="lg:col-span-5 border border-[var(--kc-hairline)] bg-[var(--kc-card)] p-4 rounded-sm">
          <AlmanacStillLife />
        </div>
      </div>

      {/* Contents Index & Numbered Chapters */}
      <section className="almanac-rule-top pt-10 mb-16">
        <div className="flex justify-between items-baseline mb-6">
          <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--kc-ink)]">
            {t('chaptersTitle')}
          </h3>
          <span className="font-annotation text-base text-[var(--kc-muted)]">
            &ldquo;Follow the fourfold food path&rdquo;
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Chapter 1 */}
          <div className="border border-[var(--kc-hairline)] p-5 bg-[var(--kc-card)] rounded-sm flex flex-col justify-between">
            <div>
              <span className="almanac-num text-[var(--kc-basil)]">{t('chapter1.num')}</span>
              <h4 className="font-bold text-base mt-2 mb-1.5 text-[var(--kc-ink)]">
                {t('chapter1.title')}
              </h4>
              <p className="text-xs text-[var(--kc-muted)] leading-relaxed">
                {t('chapter1.desc')}
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-[var(--kc-hairline)] flex items-center justify-between text-xs font-mono text-[var(--kc-muted)]">
              <span>SCAN · TRACK</span>
              <KhabarIcon name="scan" size={16} />
            </div>
          </div>

          {/* Chapter 2 */}
          <div className="border border-[var(--kc-hairline)] p-5 bg-[var(--kc-card)] rounded-sm flex flex-col justify-between">
            <div>
              <span className="almanac-num text-[var(--kc-mango)]">{t('chapter2.num')}</span>
              <h4 className="font-bold text-base mt-2 mb-1.5 text-[var(--kc-ink)]">
                {t('chapter2.title')}
              </h4>
              <p className="text-xs text-[var(--kc-muted)] leading-relaxed">
                {t('chapter2.desc')}
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-[var(--kc-hairline)] flex items-center justify-between text-xs font-mono text-[var(--kc-muted)]">
              <span>SHARE · POST</span>
              <KhabarIcon name="share" size={16} />
            </div>
          </div>

          {/* Chapter 3 */}
          <div className="border border-[var(--kc-hairline)] p-5 bg-[var(--kc-card)] rounded-sm flex flex-col justify-between">
            <div>
              <span className="almanac-num text-[var(--kc-blueberry)]">{t('chapter3.num')}</span>
              <h4 className="font-bold text-base mt-2 mb-1.5 text-[var(--kc-ink)]">
                {t('chapter3.title')}
              </h4>
              <p className="text-xs text-[var(--kc-muted)] leading-relaxed">
                {t('chapter3.desc')}
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-[var(--kc-hairline)] flex items-center justify-between text-xs font-mono text-[var(--kc-muted)]">
              <span>VERIFY · NGO</span>
              <KhabarIcon name="verified" size={16} />
            </div>
          </div>

          {/* Chapter 4 */}
          <div className="border border-[var(--kc-hairline)] p-5 bg-[var(--kc-card)] rounded-sm flex flex-col justify-between">
            <div>
              <span className="almanac-num text-[var(--kc-chilli)]">{t('chapter4.num')}</span>
              <h4 className="font-bold text-base mt-2 mb-1.5 text-[var(--kc-ink)]">
                {t('chapter4.title')}
              </h4>
              <p className="text-xs text-[var(--kc-muted)] leading-relaxed">
                {t('chapter4.desc')}
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-[var(--kc-hairline)] flex items-center justify-between text-xs font-mono text-[var(--kc-muted)]">
              <span>COMPOST · RECYCLE</span>
              <KhabarIcon name="recycle" size={16} />
            </div>
          </div>
        </div>
      </section>

      {/* Events Chapter: Horizontal Day-Timeline Strip (mandated by §7.4) */}
      <section className="almanac-rule-top pt-10 mb-16">
        <div className="flex justify-between items-baseline mb-4">
          <div className="flex items-center gap-2">
            <span className="almanac-num">DISPATCH PROTOCOL</span>
            <h3 className="text-xl font-bold text-[var(--kc-ink)]">
              Event Surplus Pipeline
            </h3>
          </div>
          <span className="text-xs font-mono text-[var(--kc-muted)] hidden sm:inline">PRE-ANNOUNCE → SURPLUS WINDOW</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 border border-[var(--kc-hairline)] rounded-sm divide-y md:divide-y-0 md:divide-x divide-[var(--kc-hairline)] bg-[var(--kc-card)] text-sm">
          <div className="p-4 space-y-1.5">
            <div className="font-mono text-xs text-[var(--kc-muted)]">PHASE A · T - 24 HOURS</div>
            <div className="font-bold text-[var(--kc-ink)]">Pre-Announcement</div>
            <p className="text-xs text-[var(--kc-muted)]">
              Banquet halls & wedding caterers broadcast expected guest count and surplus estimates to verified NGOs.
            </p>
          </div>
          <div className="p-4 space-y-1.5">
            <div className="font-mono text-xs text-[var(--kc-muted)]">PHASE B · SURPLUS CALL</div>
            <div className="font-bold text-[var(--kc-ink)]">Active Handover Ticket</div>
            <p className="text-xs text-[var(--kc-muted)]">
              Food is packed into clean containers. A 6-digit cryptographic pickup ticket is issued to the volunteer.
            </p>
          </div>
          <div className="p-4 space-y-1.5">
            <div className="font-mono text-xs text-[var(--kc-muted)]">PHASE C · CLOSURE</div>
            <div className="font-bold text-[var(--kc-ink)]">Impact & Verification</div>
            <p className="text-xs text-[var(--kc-muted)]">
              The pickup code is entered at handover. Meals saved and kg CO₂e avoided are automatically recorded.
            </p>
          </div>
        </div>
      </section>

      {/* Mandatory Safety Notice Slip (D4 food safety non-guarantee) */}
      <div className="p-4 border-l-4 border-[var(--kc-chilli)] bg-[var(--kc-card)] text-xs text-[var(--kc-muted)] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div className="flex items-center gap-2">
          <span className="almanac-stamp">SAFETY RULE</span>
          <span>Khabar Chakra connects surplus to community need. <strong>The recipient decides whether food is safe to accept.</strong></span>
        </div>
        <Link href={`/${locale}/legal/food-safety`} className="text-[var(--kc-basil)] underline shrink-0 font-medium">
          Read Food-Safety Disclaimer →
        </Link>
      </div>
    </main>
  );
}
