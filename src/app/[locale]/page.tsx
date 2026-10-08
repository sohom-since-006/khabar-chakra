import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { KhabarIcon } from '@/components/ui/KhabarIcon';

interface LandingPageProps {
  params: Promise<{ locale: string }>;
}

export default async function LandingPage({ params }: LandingPageProps) {
  const { locale } = await params;

  return (
    <div className="max-w-[1440px] mx-auto flex w-full">
      {/* Left Navigation Sidebar */}
      <AppSidebar locale={locale} />

      {/* Main Sanctuary Dashboard View */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-full overflow-hidden">
        {/* Top Hero Welcome Banner */}
        <section className="relative rounded-2xl bg-[#FDFBF7] border border-[#EAE5D9] shadow-sm overflow-hidden flex flex-col md:flex-row items-center justify-between min-h-[160px] p-6 lg:p-8 group">
          <div className="z-10 space-y-2 max-w-xl">
            <div className="leading-tight">
              <span className="font-cursive-sacramento text-3xl sm:text-4xl text-[#1B624A] font-bold block">
                Welcome back,
              </span>
              <h1 className="font-montserrat text-4xl sm:text-5xl font-black text-[#0D382B] tracking-tight block -mt-1">
                Shuvangi!
              </h1>
            </div>
            <p className="text-[11px] sm:text-xs font-bold font-mono tracking-widest text-[#5F7A6F] uppercase">
              Good Food · Less Waste · A Greener Tomorrow
            </p>
            <div className="pt-1">
              <span className="font-cursive-vibes text-2xl sm:text-3xl text-[#1B624A] italic block">
                &ldquo;Track freshness. Share with dignity.&rdquo; ♡
              </span>
            </div>
          </div>

          {/* Right Fresh Produce Bowl Image */}
          <div className="relative w-full md:w-80 h-44 sm:h-48 shrink-0 mt-4 md:mt-0 rounded-xl overflow-hidden shadow-sm border border-[#EAE5D9]">
            <Image
              src="/images/fresh_produce_bowl.jpg"
              alt="Fresh vibrant organic vegetables"
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-700"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#FDFBF7] via-transparent to-transparent md:block hidden opacity-30" />
          </div>
        </section>

        {/* Middle Section: Hero Proclamation Card + Food Waste Status Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Forest Green Proclamation Banner (7 cols) */}
          <section className="lg:col-span-7 rounded-2xl bg-gradient-to-br from-[#0B3728] via-[#0D382B] to-[#08261C] p-6 sm:p-8 text-white shadow-md relative overflow-hidden flex flex-col justify-between border border-[#144737]">
            <div className="relative z-10 space-y-3">
              <div className="flex items-center gap-2 text-xs font-mono text-[#7BD4A8] tracking-widest uppercase">
                <KhabarIcon name="plant-based" size={15} />
                <span>Proclamation No. 01</span>
              </div>

              <h2 className="font-cursive-vibes text-3xl sm:text-5xl text-[#FFD56B] leading-tight font-bold">
                Never let good food go to waste.
              </h2>

              <p className="text-xs sm:text-sm text-[#D3E8DE] leading-relaxed max-w-lg font-montserrat font-normal">
                Track freshness in your kitchen. Share surplus before the clock runs out.
                Rescue meals and redirect organic waste with dignity. Every domestic kitchen and banquet hall has moments of surplus. Our mission is to bridge the final hours with dignity, verified security, and absolute transparency.
              </p>
            </div>

            <div className="relative z-10 flex flex-wrap items-center gap-3 pt-6">
              <Link
                href={`/${locale}/home`}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#FFC93C] text-[#0A281E] font-bold text-xs sm:text-sm hover:bg-[#FFD56B] transition-all shadow-sm hover:scale-[1.02]"
              >
                <KhabarIcon name="scan" size={16} />
                <span>Open Your Kitchen Ledger →</span>
              </Link>
              <Link
                href={`/${locale}/available`}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[#217056] text-[#E0F3EB] font-semibold text-xs sm:text-sm hover:bg-[#144737] transition-all"
              >
                <KhabarIcon name="meal" size={16} />
                <span>Explore Available Food</span>
              </Link>
            </div>

            {/* Background subtle art / photo thumbnail accent */}
            <div className="absolute -bottom-6 -right-6 w-52 h-52 opacity-25 rounded-full overflow-hidden pointer-events-none">
              <Image
                src="/images/vegetables_basket.jpg"
                alt="Fresh Food Happy Homes"
                fill
                className="object-cover"
              />
            </div>
          </section>

          {/* Right: Food Waste Status Card (5 cols) */}
          <section className="lg:col-span-5 rounded-2xl bg-white border border-[#E1ECE3] p-6 shadow-sm flex flex-col justify-between space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-[#F0F5F2]">
              <div className="flex items-center gap-2">
                <span className="text-lg">🌿</span>
                <h3 className="font-cursive-sacramento text-2xl sm:text-3xl font-bold text-[#0D382B]">
                  Food Waste Status
                </h3>
              </div>
              <span className="text-[10px] font-mono text-[#0B6E3C] bg-[#E8F4EC] px-2 py-0.5 rounded-full flex items-center gap-1 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
                Live Data
              </span>
            </div>

            {/* Circular Progress & Stat Badges */}
            <div className="flex flex-col sm:flex-row items-center justify-around gap-6 py-2">
              {/* Circular Meter */}
              <div className="relative w-36 h-36 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                    stroke="#E8F4EC"
                    strokeWidth="8"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                    stroke="#10B981"
                    strokeWidth="8"
                    strokeDasharray="251.2"
                    strokeDashoffset="62.8"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute text-center leading-tight">
                  <span className="font-montserrat font-extrabold text-2xl text-[#0D382B] block">
                    48h
                  </span>
                  <span className="text-[9px] font-mono font-bold text-[#5F7A6F] uppercase block tracking-wider">
                    Max Live<br />Window
                  </span>
                </div>
              </div>

              {/* Status Pill Badges */}
              <div className="space-y-3 w-full sm:w-auto">
                <div className="flex items-center gap-2.5 p-2 rounded-xl bg-[#F0F8F4] border border-[#DCEDE2]">
                  <div className="w-7 h-7 rounded-full bg-[#207357] text-white flex items-center justify-center font-bold text-xs">
                    ₹
                  </div>
                  <div className="leading-tight">
                    <span className="text-xs font-black text-[#0D382B] block">₹0</span>
                    <span className="text-[10px] text-[#5A7A6E] font-medium uppercase">
                      Non-Profit Cost
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 p-2 rounded-xl bg-[#FFF9E6] border border-[#FEEBB3]">
                  <div className="w-7 h-7 rounded-full bg-[#F59E0B] text-white flex items-center justify-center font-bold text-xs">
                    0%
                  </div>
                  <div className="leading-tight">
                    <span className="text-xs font-black text-[#78350F] block">0%</span>
                    <span className="text-[10px] text-[#92400E] font-medium uppercase">
                      Raw Meat Allowed (D8)
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Saved Metrics */}
            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-[#F0F5F2]">
              <div className="flex items-center gap-3 p-2.5 rounded-xl bg-[#F7FAF8]">
                <div className="w-8 h-8 rounded-lg bg-[#E3EFE5] text-[#0F5132] flex items-center justify-center">
                  <KhabarIcon name="meal" size={16} />
                </div>
                <div>
                  <span className="text-[10px] text-[#557B6B] block">Food Saved</span>
                  <span className="text-base font-black text-[#0D382B]">12.5 kg</span>
                </div>
              </div>

              <div className="flex items-center gap-3 p-2.5 rounded-xl bg-[#F7FAF8]">
                <div className="w-8 h-8 rounded-lg bg-[#E3EFE5] text-[#0F5132] flex items-center justify-center">
                  <KhabarIcon name="co2-avoided" size={16} />
                </div>
                <div>
                  <span className="text-[10px] text-[#557B6B] block">CO₂ Saved</span>
                  <span className="text-base font-black text-[#0D382B]">28.7 kg</span>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Bottom Row: 4 Pastel Quick-Action Feature Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Card 1: Scan Food (Mint Green) */}
          <Link
            href={`/${locale}/inventory/add`}
            className="p-5 rounded-2xl bg-[#EBF7EE] border border-[#CCE7D4] hover:border-[#96D2A8] transition-all duration-300 flex items-center justify-between group shadow-sm hover:-translate-y-1"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-[#16583E] group-hover:scale-110 transition-transform">
                <KhabarIcon name="scan" size={22} />
              </div>
              <div>
                <h4 className="font-cursive-sacramento text-2xl font-bold text-[#16583E] block leading-none">
                  Scan Food
                </h4>
                <p className="text-[11px] text-[#4F7565] mt-1 line-clamp-1 font-medium">
                  Capture & add food items with AI.
                </p>
              </div>
            </div>
            <div className="w-8 h-8 rounded-full bg-[#1E7050] text-white flex items-center justify-center text-xs group-hover:translate-x-1 transition-transform shrink-0">
              →
            </div>
          </Link>

          {/* Card 2: My Inventory (Sky Blue) */}
          <Link
            href={`/${locale}/home`}
            className="p-5 rounded-2xl bg-[#EBF3FC] border border-[#CDE1F8] hover:border-[#96C2F2] transition-all duration-300 flex items-center justify-between group shadow-sm hover:-translate-y-1"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-[#1E5698] group-hover:scale-110 transition-transform">
                <KhabarIcon name="fridge" size={22} />
              </div>
              <div>
                <h4 className="font-cursive-sacramento text-2xl font-bold text-[#1E5698] block leading-none">
                  My Inventory
                </h4>
                <p className="text-[11px] text-[#557396] mt-1 line-clamp-1 font-medium">
                  Track your food, get smart reminders.
                </p>
              </div>
            </div>
            <div className="w-8 h-8 rounded-full bg-[#245FAC] text-white flex items-center justify-center text-xs group-hover:translate-x-1 transition-transform shrink-0">
              →
            </div>
          </Link>

          {/* Card 3: Find Recipes (Peach / Coral) */}
          <Link
            href={`/${locale}/recipes`}
            className="p-5 rounded-2xl bg-[#FDF1EC] border border-[#F8D6C9] hover:border-[#F1AB94] transition-all duration-300 flex items-center justify-between group shadow-sm hover:-translate-y-1"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-[#BA442B] group-hover:scale-110 transition-transform">
                <KhabarIcon name="cook" size={22} />
              </div>
              <div>
                <h4 className="font-cursive-sacramento text-2xl font-bold text-[#BA442B] block leading-none">
                  Find Recipes
                </h4>
                <p className="text-[11px] text-[#8C5D53] mt-1 line-clamp-1 font-medium">
                  Turn leftovers into delicious meals.
                </p>
              </div>
            </div>
            <div className="w-8 h-8 rounded-full bg-[#D14F30] text-white flex items-center justify-center text-xs group-hover:translate-x-1 transition-transform shrink-0">
              →
            </div>
          </Link>

          {/* Card 4: Share / Donate (Lavender Purple) */}
          <Link
            href={`/${locale}/share/new`}
            className="p-5 rounded-2xl bg-[#F3EEFC] border border-[#DDCEF7] hover:border-[#BA9EF0] transition-all duration-300 flex items-center justify-between group shadow-sm hover:-translate-y-1"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-[#673BB8] group-hover:scale-110 transition-transform">
                <KhabarIcon name="donate" size={22} />
              </div>
              <div>
                <h4 className="font-cursive-sacramento text-2xl font-bold text-[#673BB8] block leading-none">
                  Share / Donate
                </h4>
                <p className="text-[11px] text-[#69568B] mt-1 line-clamp-1 font-medium">
                  Help others, spread kindness.
                </p>
              </div>
            </div>
            <div className="w-8 h-8 rounded-full bg-[#7543D3] text-white flex items-center justify-center text-xs group-hover:translate-x-1 transition-transform shrink-0">
              →
            </div>
          </Link>
        </section>
      </main>
    </div>
  );
}
