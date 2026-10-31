
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { KhabarIcon } from '@/components/ui/KhabarIcon';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { useUserSession } from '@/hooks/useUserSession';
import { InventoryItem } from '@/domain/types';
import { getCleanInventory } from '@/utils/inventoryStorage';

// Types for culinary recipes and planning
interface RecipeItem {
  id: string;
  title: string;
  subtitle: string;
  cuisine: string;
  method: 'Grilling' | 'Roasting' | 'Baking' | 'Frying';
  timeMin: number;
  calories: number;
  servingsDefault: number;
  bgPillClass: string;
  image: string;
  ingredients: { name: string; icon: string; matchedInPantry?: boolean }[];
  steps: string[];
}

const RECIPES_DATA: RecipeItem[] = [
  {
    id: 'stir-fry-rice',
    title: 'Rice filled with stir fry',
    subtitle: 'Italian • Frying',
    cuisine: 'Italian',
    method: 'Frying',
    timeMin: 30,
    calories: 340,
    servingsDefault: 2,
    bgPillClass: 'bg-[var(--bento-sage-bg)] border-[var(--bento-sage-border)] text-[var(--bento-sage-text)]',
    image: '/images/culinary/stir_fry_pan.jpg',
    ingredients: [
      { name: 'Broccoli', icon: '🥦' },
      { name: 'Fresh Herbs', icon: '🌿' },
      { name: 'Chickpeas', icon: '🫘' },
      { name: 'Coriander', icon: '🌱' },
      { name: 'Ginger', icon: '🫚' },
      { name: 'Fresh Lemon', icon: '🍋' },
      { name: 'Bell Pepper', icon: '🫑' },
      { name: 'Gobindobhog Rice', icon: '🌾' },
    ],
    steps: [
      'Prepare ingredients: rinse broccoli florets and parboil Gobindobhog rice until 80% tender.',
      'Heat sesame oil in high-heat skillet, flash fry fresh aromatics, ginger, and diced bell peppers.',
      'Toss rice with citrus drizzle, fresh coriander, and crisp vegetables; serve piping hot.',
    ],
  },
  {
    id: 'salmon-salad',
    title: 'Lemon Herb Salmon Salad',
    subtitle: 'French • Fresh Pan Roast',
    cuisine: 'French',
    method: 'Grilling',
    timeMin: 45,
    calories: 420,
    servingsDefault: 2,
    bgPillClass: 'bg-[var(--bento-sage-bg)] border-[var(--bento-sage-border)] text-[var(--bento-sage-text)]',
    image: '/images/culinary/salmon_salad.jpg',
    ingredients: [
      { name: 'Fresh Salmon', icon: '🐟' },
      { name: 'Avocado', icon: '🥑' },
      { name: 'Spinach', icon: '🥬' },
      { name: 'Cucumber', icon: '🥒' },
      { name: 'Fresh Lemon', icon: '🍋' },
      { name: 'Olive Oil', icon: '🫒' },
    ],
    steps: [
      'Sear salmon fillet with coarse sea salt, cracked black pepper, and lemon zest for 4 minutes per side.',
      'Slice ripe avocado, crisp cucumber, and toss with baby spinach leaves.',
      'Whisk lemon-dill vinaigrette, drape over warm salmon and fresh garden salad greens.',
    ],
  },
  {
    id: 'chocolate-pie',
    title: 'Delicious Pie With Chocolate',
    subtitle: 'Greek • Oven Baking',
    cuisine: 'Greek',
    method: 'Baking',
    timeMin: 55,
    calories: 480,
    servingsDefault: 4,
    bgPillClass: 'bg-[var(--bento-butter-bg)] border-[var(--bento-butter-border)] text-[var(--bento-butter-text)]',
    image: '/images/culinary/baking_dish.jpg',
    ingredients: [
      { name: 'Artisan Flour', icon: '🌾' },
      { name: 'Dark Cocoa', icon: '🍫' },
      { name: 'Organic Milk', icon: '🥛' },
      { name: 'Wild Berries', icon: '🫐' },
      { name: 'Cinnamon', icon: '🪵' },
    ],
    steps: [
      'Roll chilled flaky butter pastry dough and fit into a fluted pie dish.',
      'Fill with velvety dark chocolate ganache, infused with cinnamon and sweet berries.',
      'Bake at 180°C until crust is deep golden brown and fragrant. Dust with powdered sugar.',
    ],
  },
  {
    id: 'roast-chicken',
    title: 'Golden Herb Roast Platter',
    subtitle: 'French • Slow Roasting',
    cuisine: 'French',
    method: 'Roasting',
    timeMin: 60,
    calories: 520,
    servingsDefault: 3,
    bgPillClass: 'bg-[var(--bento-peach-bg)] border-[var(--bento-peach-border)] text-[var(--bento-peach-text)]',
    image: '/images/culinary/roasting_dish.jpg',
    ingredients: [
      { name: 'Tender Cuts', icon: '🍗' },
      { name: 'Baby Carrots', icon: '🥕' },
      { name: 'Red Onions', icon: '🧅' },
      { name: 'Rosemary', icon: '🌿' },
      { name: 'Garlic Cloves', icon: '🧄' },
    ],
    steps: [
      'Toss root vegetables and aromatics in extra virgin olive oil with sea salt.',
      'Arrange seasoned chicken cuts in ceramic baking dish surrounded by sweet onions and herbs.',
      'Roast in oven at 200°C for 45 minutes until skin crackles and juices run clear.',
    ],
  },
];

const CUISINES = [
  { name: 'Italian', flag: '🇮🇹' },
  { name: 'French', flag: '🇫🇷' },
  { name: 'Greek', flag: '🇬🇷' },
  { name: 'Chinese', flag: '🇨🇳' },
  { name: 'Indian', flag: '🇮🇳' },
];

export default function CulinaryPlannerPage() {
  const { displayName, avatarUrl, initials } = useUserSession();

  // Active state
  const [selectedCuisine, setSelectedCuisine] = useState<string>('Italian');
  const [activeRecipeId, setActiveRecipeId] = useState<string>('stir-fry-rice');
  const [activeStep, setActiveStep] = useState<number>(1);
  const [portionAmount, setPortionAmount] = useState<number>(2);
  const [portionUnit, setPortionUnit] = useState<'EU' | 'Mtr'>('EU');
  const [favorites, setFavorites] = useState<{ [key: string]: boolean }>({
    Grilling: true,
    Roasting: false,
    Baking: true,
  });

  // Calendar state
  const [selectedDay, setSelectedDay] = useState<number>(13);
  const [calendarMonth, setCalendarMonth] = useState('August');

  // Live pantry items from localStorage
  const [pantryItems, setPantryItems] = useState<InventoryItem[]>([]);
  const [expiringNotice, setExpiringNotice] = useState<string | null>(null);

  // Active recipe object
  const activeRecipe = RECIPES_DATA.find((r) => r.id === activeRecipeId) || RECIPES_DATA[0];

  useEffect(() => {
    try {
      const parsed: InventoryItem[] = getCleanInventory();
      setPantryItems(parsed);
      const urgent = parsed.filter((item) => {
        if (!item.expiryDate || item.status !== 'active') return false;
        const hrs = (new Date(item.expiryDate).getTime() - Date.now()) / 3600000;
        return hrs <= 48;
      });
      if (urgent.length > 0) {
        setExpiringNotice(
          `${urgent.length} shelf item(s) (${urgent.map((u) => u.name).join(', ')}) should be cooked first!`
        );
      }
    } catch {
      // safe fallback
    }
  }, []);

  const toggleFavorite = (method: string) => {
    setFavorites((prev) => ({ ...prev, [method]: !prev[method] }));
  };

  const handleCuisineSelect = (cName: string) => {
    setSelectedCuisine(cName);
    const match = RECIPES_DATA.find((r) => r.cuisine.toLowerCase() === cName.toLowerCase());
    if (match) {
      setActiveRecipeId(match.id);
    }
  };

  // Days in calendar month
  const calendarDays = [
    { day: 28, isOtherMonth: true },
    { day: 29, isOtherMonth: true },
    { day: 30, isOtherMonth: true },
    { day: 31, isOtherMonth: true },
    { day: 1 },
    { day: 2 },
    { day: 3 },
    { day: 4, badge: 'hotdog', badgeBg: 'bg-[var(--bento-sage-bg)] text-emerald-800 dark:text-emerald-300' },
    { day: 5 },
    { day: 6 },
    { day: 7 },
    { day: 8 },
    { day: 9, badge: 'cake', badgeBg: 'bg-[var(--bento-rose-bg)] text-rose-800 dark:text-rose-300' },
    { day: 10 },
    { day: 11 },
    { day: 12 },
    { day: 13, badge: 'ramen', badgeBg: 'bg-[#183B2C] text-white ring-2 ring-[var(--kc-basil)] font-bold' },
    { day: 14 },
    { day: 15 },
    { day: 16 },
    { day: 17 },
    { day: 18 },
    { day: 19 },
    { day: 20 },
    { day: 21 },
    { day: 22, badge: 'chicken', badgeBg: 'bg-[var(--bento-butter-bg)] text-amber-800 dark:text-amber-300' },
    { day: 23 },
    { day: 24 },
    { day: 25 },
    { day: 26 },
    { day: 27, badge: 'cake', badgeBg: 'bg-[var(--bento-rose-bg)] text-rose-800 dark:text-rose-300' },
    { day: 28 },
    { day: 29 },
    { day: 30 },
    { day: 1, isOtherMonth: true },
  ];

  return (
    <div className="min-h-screen bg-[#F6F8F6] dark:bg-[#07130E] text-[var(--kc-ink)] flex flex-col md:flex-row transition-colors duration-300 antialiased">
      {/* ------------------------------------------------------------- */}
      {/* Left Slim Dock Sidebar (Matches Sample Mockup Exactly)        */}
      {/* ------------------------------------------------------------- */}
      <aside
        aria-label="Culinary Dock"
        className="w-full md:w-20 lg:w-24 shrink-0 bg-white dark:bg-[#0B1E15] border-b md:border-b-0 md:border-r border-neutral-200 dark:border-[#1A382B] flex md:flex-col items-center justify-between p-3 md:py-6 md:px-2 shadow-sm z-30 transition-colors"
      >
        {/* Top Chef Emblem / Brand Mark */}
        <div className="flex md:flex-col items-center gap-4">
          <Link
            href="/en/home"
            title="Khabar Chakra Culinary Hub"
            className="w-12 h-12 rounded-full border border-neutral-200 dark:border-[#22503B] bg-neutral-50 dark:bg-[#122A1F] flex items-center justify-center text-xl shadow-xs hover:scale-105 transition-transform"
          >
            👨‍🍳
          </Link>

          {/* Quick Action (+) Button */}
          <Link
            href="/en/inventory/add"
            title="Scan or Add Food Item"
            className="w-11 h-11 rounded-full bg-neutral-900 text-white dark:bg-[#22B282] dark:text-[#061A12] flex items-center justify-center font-bold text-xl hover:scale-110 active:scale-95 transition-all shadow-md"
          >
            +
          </Link>
        </div>

        {/* Center Navigation Icons Stack */}
        <nav className="flex md:flex-col items-center gap-2.5 my-auto">
          <Link
            href="/en"
            title="Dashboard Overview"
            className="w-11 h-11 rounded-2xl flex items-center justify-center text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-[#163628] transition-colors"
          >
            <KhabarIcon name="household" size={20} />
          </Link>

          <Link
            href="/en/inventory"
            title="Search & Urgency Shelf"
            className="w-11 h-11 rounded-2xl flex items-center justify-center text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-[#163628] transition-colors"
          >
            <KhabarIcon name="search" size={20} />
          </Link>

          <Link
            href="/en/recipes"
            title="Recipe Rescue & Videos"
            className="w-11 h-11 rounded-2xl flex items-center justify-center text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-[#163628] transition-colors"
          >
            <KhabarIcon name="cook" size={20} />
          </Link>

          {/* Active Planner Calendar Tab (highlighted with pale mint pill) */}
          <div
            title="Culinary & Meal Planner (Active)"
            className="w-11 h-11 rounded-2xl bg-[var(--bento-sage-bg)] text-[var(--bento-sage-text)] flex items-center justify-center shadow-xs font-bold"
          >
            <KhabarIcon name="calendar" size={20} />
          </div>

          <Link
            href="/en/notifications"
            title="Notifications & Expiry Alerts"
            className="w-11 h-11 rounded-2xl flex items-center justify-center text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-[#163628] relative transition-colors"
          >
            <KhabarIcon name="bell" size={20} />
            <span className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-[#D6381F] ring-2 ring-white dark:ring-[#0B1E15]" />
          </Link>
        </nav>

        {/* Bottom Dock: Theme Toggle, Settings & User Profile Avatar */}
        <div className="flex md:flex-col items-center gap-3">
          {/* Working Light/Dark Mode Switcher */}
          <ThemeToggle />

          <Link
            href="/en/settings"
            title="Kitchen Settings"
            className="w-10 h-10 rounded-full flex items-center justify-center text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-[#163628] transition-colors"
          >
            <KhabarIcon name="sliders" size={18} />
          </Link>

          <Link
            href="/en/profile"
            title="User Profile"
            className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-neutral-300 dark:border-[#22B282] shrink-0"
          >
            {avatarUrl ? (
              <Image src={avatarUrl} alt={displayName || 'Chef'} fill className="object-cover" />
            ) : (
              <div className="w-full h-full bg-[#183B2C] text-emerald-300 flex items-center justify-center font-bold text-xs">
                {initials || '👨‍🍳'}
              </div>
            )}
          </Link>
        </div>
      </aside>

      {/* ------------------------------------------------------------- */}
      {/* Main Culinary Bento Workspace                                 */}
      {/* ------------------------------------------------------------- */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1560px] mx-auto w-full space-y-6 overflow-x-hidden">
        {/* Top Header Row: Greeting, Headline & Cuisine Filter Chips */}
        <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-2">
          <div>
            <div className="text-xs sm:text-sm font-semibold text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5">
              <span>Hello, {displayName || 'John'}</span>
              <span className="text-base">👋</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-[var(--kc-ink)] mt-0.5">
              What dish you want to learn to cook today?
            </h1>
          </div>

          {/* Cuisine Filter Pills with Flags */}
          <div
            className="flex flex-wrap items-center gap-2 overflow-x-auto py-1"
            role="tablist"
            aria-label="Cuisine Filters"
          >
            {CUISINES.map((item) => {
              const isSelected = selectedCuisine.toLowerCase() === item.name.toLowerCase();
              return (
                <button
                  key={item.name}
                  type="button"
                  onClick={() => handleCuisineSelect(item.name)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all shadow-xs ${isSelected
                    ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 scale-105 shadow-md'
                    : 'bg-white dark:bg-[#10241A] text-neutral-700 dark:text-neutral-200 border border-neutral-200 dark:border-[#1E4331] hover:border-neutral-400 dark:hover:border-neutral-500'
                    }`}
                >
                  <span className="text-base">{item.flag}</span>
                  <span>{item.name}</span>
                </button>
              );
            })}
          </div>
        </header>

        {/* Expiring Ingredients Domestic Banner if pantry has urgent food */}
        {expiringNotice && (
          <div className="p-3.5 rounded-2xl bg-[var(--bento-rose-bg)] border border-[var(--bento-rose-border)] text-[var(--bento-rose-text)] flex items-center justify-between gap-3 text-xs sm:text-sm font-semibold shadow-xs">
            <div className="flex items-center gap-2">
              <span className="text-base">🚨</span>
              <span>{expiringNotice}</span>
            </div>
            <Link
              href="/en/inventory"
              className="text-xs uppercase tracking-wider underline font-bold shrink-0 hover:opacity-80"
            >
              Prioritize Shelf →
            </Link>
          </div>
        )}

        {/* ----------------------------------------------------------- */}
        {/* The 3-Column Bento Grid Layout                               */}
        {/* ----------------------------------------------------------- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
          {/* ========================================================= */}
          {/* COLUMN 1: Calendar & Courses (4 cols)                     */}
          {/* ========================================================= */}
          <div className="lg:col-span-4 space-y-5">
            {/* 1. Date / Month Interactive Calendar Card */}
            <section
              aria-label="Meal Planning Calendar"
              className="bg-white dark:bg-[#0E2219] rounded-3xl p-5 border border-neutral-200/90 dark:border-[#1A3D2D] shadow-sm space-y-4"
            >
              {/* Calendar Month Header */}
              <div className="flex items-center justify-between pb-1">
                <button
                  type="button"
                  className="flex items-center gap-2 font-bold text-base sm:text-lg text-[var(--kc-ink)] hover:opacity-80"
                >
                  <span>Tuesday, {selectedDay} {calendarMonth}</span>
                  <span className="text-xs text-amber-600 dark:text-amber-400">∨</span>
                </button>
                <span className="text-xs font-mono font-bold text-neutral-400 dark:text-neutral-500">
                  2026
                </span>
              </div>

              {/* Weekday headers */}
              <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-neutral-400 dark:text-neutral-500">
                <span>Mon</span>
                <span>Tue</span>
                <span>Wed</span>
                <span>Thr</span>
                <span>Fri</span>
                <span>Sat</span>
                <span>Sun</span>
              </div>

              {/* Days Grid */}
              <div className="grid grid-cols-7 gap-1 text-center">
                {calendarDays.map((d, idx) => {
                  const isSelected = d.day === selectedDay && !d.isOtherMonth;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => !d.isOtherMonth && setSelectedDay(d.day)}
                      className={`relative h-10 w-full rounded-full flex flex-col items-center justify-center text-xs font-semibold transition-all ${d.isOtherMonth
                        ? 'text-neutral-300 dark:text-neutral-600'
                        : isSelected
                          ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 font-bold scale-105 shadow-sm'
                          : 'text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-[#163628]'
                        }`}
                    >
                      {d.badge ? (
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold shadow-xs ${d.badgeBg}`}
                        >
                          {d.badge === 'hotdog' && '🌭'}
                          {d.badge === 'cake' && '🍰'}
                          {d.badge === 'ramen' && '🍜'}
                          {d.badge === 'chicken' && '🍗'}
                        </div>
                      ) : (
                        <span>{d.day}</span>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="pt-2 border-t border-neutral-100 dark:border-[#17382B] flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400 font-medium">
                <span>Planned zero-waste meals</span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">4 scheduled</span>
              </div>
            </section>

            {/* 2. My Courses / Kitchen Skills Card */}
            <section
              aria-label="Culinary Courses"
              className="bg-white dark:bg-[#0E2219] rounded-3xl p-5 border border-neutral-200/90 dark:border-[#1A3D2D] shadow-sm space-y-4"
            >
              <div className="flex items-center justify-between">
                <h2 className="font-extrabold text-base sm:text-lg text-[var(--kc-ink)]">
                  My Courses
                </h2>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    title="Filter Courses"
                    className="w-8 h-8 rounded-full flex items-center justify-center text-neutral-500 hover:bg-neutral-100 dark:hover:bg-[#163628]"
                  >
                    <KhabarIcon name="filter" size={16} />
                  </button>
                  <button
                    type="button"
                    title="Add Goal"
                    className="w-8 h-8 rounded-full bg-neutral-900 text-white dark:bg-emerald-500 dark:text-neutral-950 flex items-center justify-center font-bold text-sm shadow-xs hover:scale-105"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Course Items List */}
              <div className="space-y-3">
                {/* 1. Chef's Masterclass */}
                <div className="flex items-center justify-between p-3 rounded-2xl bg-neutral-50 dark:bg-[#122A1E] border border-neutral-100 dark:border-[#1A3B2B] hover:shadow-xs transition-shadow">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-[var(--bento-rose-bg)] border border-[var(--bento-rose-border)] flex items-center justify-center text-lg shadow-2xs">
                      👨‍🍳
                    </div>
                    <div>
                      <h3 className="font-bold text-xs sm:text-sm text-[var(--kc-ink)]">
                        Chef&apos;s Masterclass
                      </h3>
                      <div className="flex items-center gap-2 text-[11px] text-neutral-500 dark:text-neutral-400 font-medium mt-0.5">
                        <span>⏱ 45 min</span>
                        <span>•</span>
                        <span className="text-amber-600 dark:text-amber-400 font-semibold">Beginner</span>
                      </div>
                    </div>
                  </div>

                  {/* Circular Progress Ring */}
                  <div className="relative w-10 h-10 flex items-center justify-center">
                    <svg className="w-10 h-10 -rotate-90" viewBox="0 0 36 36">
                      <path
                        className="text-neutral-200 dark:text-[#1F4532]"
                        strokeWidth="3"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        className="text-emerald-500"
                        strokeDasharray="95, 100"
                        strokeWidth="3"
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                    <span className="absolute text-[10px] font-extrabold text-[var(--kc-ink)]">
                      95%
                    </span>
                  </div>
                </div>

                {/* 2. Kitchen Skills 101 */}
                <div className="flex items-center justify-between p-3 rounded-2xl bg-neutral-50 dark:bg-[#122A1E] border border-neutral-100 dark:border-[#1A3B2B] hover:shadow-xs transition-shadow">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-[var(--bento-sky-bg)] border border-[var(--bento-sky-border)] flex items-center justify-center text-lg shadow-2xs">
                      🍲
                    </div>
                    <div>
                      <h3 className="font-bold text-xs sm:text-sm text-[var(--kc-ink)]">
                        Kitchen Skills 101
                      </h3>
                      <div className="flex items-center gap-2 text-[11px] text-neutral-500 dark:text-neutral-400 font-medium mt-0.5">
                        <span>⏱ 45 min</span>
                        <span>•</span>
                        <span className="text-amber-600 dark:text-amber-400 font-semibold">Beginner</span>
                      </div>
                    </div>
                  </div>

                  {/* Circular Progress Ring */}
                  <div className="relative w-10 h-10 flex items-center justify-center">
                    <svg className="w-10 h-10 -rotate-90" viewBox="0 0 36 36">
                      <path
                        className="text-neutral-200 dark:text-[#1F4532]"
                        strokeWidth="3"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        className="text-amber-500"
                        strokeDasharray="64, 100"
                        strokeWidth="3"
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                    <span className="absolute text-[10px] font-extrabold text-[var(--kc-ink)]">
                      64%
                    </span>
                  </div>
                </div>

                {/* 3. Kitchen Skills 102 (Zero-Waste Mastery) */}
                <div className="flex items-center justify-between p-3 rounded-2xl bg-neutral-50 dark:bg-[#122A1E] border border-neutral-100 dark:border-[#1A3B2B] hover:shadow-xs transition-shadow">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-[var(--bento-sage-bg)] border border-[var(--bento-sage-border)] flex items-center justify-center text-lg shadow-2xs">
                      🌿
                    </div>
                    <div>
                      <h3 className="font-bold text-xs sm:text-sm text-[var(--kc-ink)]">
                        Pantry Rescue 102
                      </h3>
                      <div className="flex items-center gap-2 text-[11px] text-neutral-500 dark:text-neutral-400 font-medium mt-0.5">
                        <span>⏱ 45 min</span>
                        <span>•</span>
                        <span className="text-amber-600 dark:text-amber-400 font-semibold">Beginner</span>
                      </div>
                    </div>
                  </div>

                  {/* Circular Progress Ring */}
                  <div className="relative w-10 h-10 flex items-center justify-center">
                    <svg className="w-10 h-10 -rotate-90" viewBox="0 0 36 36">
                      <path
                        className="text-neutral-200 dark:text-[#1F4532]"
                        strokeWidth="3"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        className="text-amber-500"
                        strokeDasharray="64, 100"
                        strokeWidth="3"
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                    <span className="absolute text-[10px] font-extrabold text-[var(--kc-ink)]">
                      64%
                    </span>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* ========================================================= */}
          {/* COLUMN 2: Stepper, Techniques, Wave & Ingredients (5 cols)*/}
          {/* ========================================================= */}
          <div className="lg:col-span-5 space-y-5">
            {/* 1. Step Indicator Pills */}
            <div className="flex items-center justify-between gap-3">
              {[1, 2, 3].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setActiveStep(s)}
                  className={`flex-1 py-2 px-3 rounded-full text-xs font-bold transition-all text-center ${activeStep === s
                    ? 'bg-[var(--bento-sage-bg)] text-[var(--bento-sage-text)] border border-[var(--bento-sage-border)] shadow-xs scale-102'
                    : 'border border-dashed border-neutral-300 dark:border-[#22503A] text-neutral-500 dark:text-neutral-400 hover:border-neutral-500'
                    }`}
                >
                  {s} Step
                </button>
              ))}
            </div>

            {/* 2. Cooking Technique Cards (Pastel Carousel) */}
            <section
              aria-label="Cooking Techniques"
              className="grid grid-cols-3 gap-3"
            >
              {/* Grilling Card (Rose) */}
              <div
                onClick={() => setActiveRecipeId('salmon-salad')}
                className="group cursor-pointer rounded-3xl p-3 sm:p-4 bg-[var(--bento-rose-bg)] border border-[var(--bento-rose-border)] text-[var(--bento-rose-text)] flex flex-col items-center justify-between min-h-[170px] shadow-sm hover:scale-102 transition-transform relative"
              >
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite('Grilling');
                  }}
                  title="Favorite Grilling"
                  className="absolute top-2.5 right-2.5 text-xs text-[var(--bento-rose-text)] hover:scale-125 transition-transform"
                >
                  {favorites.Grilling ? '❤️' : '🤍'}
                </button>

                <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border-2 border-white dark:border-[#4A1D30] shadow-sm mt-1">
                  <Image
                    src="/images/culinary/grilling_dish.jpg"
                    alt="Grilling Technique"
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <span className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-neutral-900 text-white flex items-center justify-center text-[10px]">
                    🔥
                  </span>
                </div>

                <span className="font-extrabold text-xs sm:text-sm mt-2">
                  Grilling
                </span>
              </div>

              {/* Roasting Card (Buttercup Yellow) */}
              <div
                onClick={() => setActiveRecipeId('roast-chicken')}
                className="group cursor-pointer rounded-3xl p-3 sm:p-4 bg-[var(--bento-butter-bg)] border border-[var(--bento-butter-border)] text-[var(--bento-butter-text)] flex flex-col items-center justify-between min-h-[170px] shadow-sm hover:scale-102 transition-transform relative"
              >
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite('Roasting');
                  }}
                  title="Favorite Roasting"
                  className="absolute top-2.5 right-2.5 text-xs text-[var(--bento-butter-text)] hover:scale-125 transition-transform"
                >
                  {favorites.Roasting ? '❤️' : '🤍'}
                </button>

                <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border-2 border-white dark:border-[#4D3F14] shadow-sm mt-1">
                  <Image
                    src="/images/culinary/roasting_dish.jpg"
                    alt="Roasting Technique"
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <span className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-neutral-900 text-white flex items-center justify-center text-[10px]">
                    🍗
                  </span>
                </div>

                <span className="font-extrabold text-xs sm:text-sm mt-2">
                  Roasting
                </span>
              </div>

              {/* Baking Card (Sky Blue) */}
              <div
                onClick={() => setActiveRecipeId('chocolate-pie')}
                className="group cursor-pointer rounded-3xl p-3 sm:p-4 bg-[var(--bento-sky-bg)] border border-[var(--bento-sky-border)] text-[var(--bento-sky-text)] flex flex-col items-center justify-between min-h-[170px] shadow-sm hover:scale-102 transition-transform relative"
              >
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite('Baking');
                  }}
                  title="Favorite Baking"
                  className="absolute top-2.5 right-2.5 text-xs text-[var(--bento-sky-text)] hover:scale-125 transition-transform"
                >
                  {favorites.Baking ? '❤️' : '🤍'}
                </button>

                <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border-2 border-white dark:border-[#1E4357] shadow-sm mt-1">
                  <Image
                    src="/images/culinary/baking_dish.jpg"
                    alt="Baking Technique"
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <span className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-neutral-900 text-white flex items-center justify-center text-[10px]">
                    🥧
                  </span>
                </div>

                <span className="font-extrabold text-xs sm:text-sm mt-2">
                  Baking
                </span>
              </div>
            </section>

            {/* 3. Cooking Schedule / Wave Curve Graph */}
            <section
              aria-label="Cooking Heat Wave"
              className="bg-white dark:bg-[#0E2219] rounded-3xl p-4 sm:p-5 border border-neutral-200/90 dark:border-[#1A3D2D] shadow-sm relative overflow-hidden"
            >
              <div className="flex items-center justify-between mb-3 text-xs font-semibold text-neutral-500 dark:text-neutral-400">
                <span className="px-2.5 py-0.5 rounded-full bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 font-bold text-[10px]">
                  Mid
                </span>
                <span className="font-mono text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">
                  Simmer &amp; Thermal Balance
                </span>
              </div>

              {/* Wave SVG Graph */}
              <div className="relative h-20 w-full">
                <svg
                  className="w-full h-full"
                  viewBox="0 0 300 80"
                  preserveAspectRatio="none"
                  fill="none"
                >
                  <defs>
                    <linearGradient id="waveGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#34D399" stopOpacity="0.45" />
                      <stop offset="100%" stopColor="#34D399" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M0 60 Q 50 70 80 40 T 170 30 T 260 25 L 300 45 L 300 80 L 0 80 Z"
                    fill="url(#waveGradient)"
                  />
                  <path
                    d="M0 60 Q 50 70 80 40 T 170 30 T 260 25 L 300 45"
                    stroke="#10B981"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                </svg>

                {/* Timeline Checkpoint Pins */}
                <div className="absolute inset-0 flex items-center justify-between px-8 sm:px-12 pointer-events-none">
                  {/* Point 1: 8:00 */}
                  <div className="flex flex-col items-center -translate-y-1">
                    <div className="w-8 h-8 rounded-full bg-neutral-900 text-white dark:bg-emerald-400 dark:text-neutral-950 flex items-center justify-center text-xs shadow-md">
                      🍲
                    </div>
                  </div>

                  {/* Point 2: 9:00 */}
                  <div className="flex flex-col items-center -translate-y-4">
                    <div className="w-8 h-8 rounded-full bg-neutral-900 text-white dark:bg-emerald-400 dark:text-neutral-950 flex items-center justify-center text-xs shadow-md">
                      🍳
                    </div>
                  </div>

                  {/* Point 3: 10:00 */}
                  <div className="flex flex-col items-center -translate-y-5">
                    <div className="w-8 h-8 rounded-full bg-neutral-900 text-white dark:bg-emerald-400 dark:text-neutral-950 flex items-center justify-center text-xs shadow-md">
                      👨‍🍳
                    </div>
                  </div>
                </div>
              </div>

              {/* Time markers row */}
              <div className="flex items-center justify-between px-8 sm:px-12 text-[11px] font-mono font-bold text-neutral-400 dark:text-neutral-500 pt-2 border-t border-neutral-100 dark:border-[#17382B]">
                <span>8:00</span>
                <span>9:00</span>
                <span>10:00</span>
              </div>
            </section>

            {/* 4. Ingredients Grid Explorer Card */}
            <section
              aria-label="Ingredients Grid"
              className="bg-white dark:bg-[#0E2219] rounded-3xl p-5 border border-neutral-200/90 dark:border-[#1A3D2D] shadow-sm space-y-4"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-extrabold text-[var(--kc-ink)]">
                  Pantry Freshness &amp; Ingredients
                </span>
                <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                  {activeRecipe.ingredients.length} items
                </span>
              </div>

              {/* Circular Ingredient Icons Grid */}
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2.5">
                {activeRecipe.ingredients.map((ing, i) => (
                  <button
                    key={i}
                    type="button"
                    title={ing.name}
                    className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-neutral-50 dark:bg-[#122A1E] border border-neutral-200/80 dark:border-[#1F4532] flex items-center justify-center text-lg sm:text-xl hover:scale-110 active:scale-95 transition-transform shadow-2xs group relative"
                  >
                    <span>{ing.icon}</span>
                    <span className="absolute -bottom-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#0E2219]" />
                  </button>
                ))}

                {/* Add Custom Ingredient button */}
                <button
                  type="button"
                  title="Add ingredient"
                  className="w-11 h-11 sm:w-12 sm:h-12 rounded-full border-2 border-dashed border-neutral-300 dark:border-[#22503B] flex items-center justify-center text-neutral-400 hover:text-neutral-800 dark:hover:text-white font-bold text-lg hover:scale-105 transition-transform"
                >
                  +
                </button>
              </div>

              {/* Recipe Meta Footer with Explore and Next Buttons */}
              <div className="pt-3 border-t border-neutral-100 dark:border-[#17382B] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-extrabold text-sm sm:text-base text-[var(--kc-ink)]">
                    {activeRecipe.title}
                  </h3>
                  <div className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">
                    {activeRecipe.subtitle}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => alert(`Exploring complete recipe instructions for: ${activeRecipe.title}`)}
                    className="px-4 py-2 rounded-full bg-[var(--bento-sage-bg)] text-[var(--bento-sage-text)] border border-[var(--bento-sage-border)] font-bold text-xs hover:opacity-90 transition-opacity shadow-2xs"
                  >
                    Explore
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const nextStep = activeStep < 3 ? activeStep + 1 : 1;
                      setActiveStep(nextStep);
                    }}
                    className="px-4 py-2 rounded-full bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 font-bold text-xs hover:opacity-90 transition-opacity shadow-2xs"
                  >
                    Next &gt;
                  </button>
                </div>
              </div>
            </section>
          </div>

          {/* ========================================================= */}
          {/* COLUMN 3: Hero Active Card, Servings & Recipe Stack (3 cols)*/}
          {/* ========================================================= */}
          <div className="lg:col-span-3 space-y-4">
            {/* 1. Hero Active Recipe Card */}
            <section
              aria-label="Active Recipe Hero"
              className="relative rounded-3xl overflow-hidden min-h-[170px] p-5 text-white flex flex-col justify-end shadow-md group border border-neutral-200 dark:border-neutral-800"
            >
              <Image
                src={activeRecipe.image}
                alt={activeRecipe.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-700 brightness-75"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

              {/* Chef Hat Badge */}
              <div className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-sm shadow-sm">
                👨‍🍳
              </div>

              <div className="relative z-10 space-y-0.5">
                <span className="font-extrabold text-sm sm:text-base block">
                  Prepare ingredients
                </span>
                <span className="text-xs text-neutral-200 font-medium block truncate">
                  {activeRecipe.title}
                </span>
              </div>
            </section>

            {/* 2. Amount / Portion & Unit Toggle Card */}
            <div className="flex items-center justify-between gap-3 p-2 bg-white dark:bg-[#0E2219] rounded-3xl border border-neutral-200/90 dark:border-[#1A3D2D] shadow-xs">
              {/* Stepper with Amount */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPortionAmount((prev) => Math.max(1, prev - 1))}
                  className="w-8 h-8 rounded-full bg-[var(--bento-sage-bg)] text-[var(--bento-sage-text)] font-bold text-sm flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
                >
                  -
                </button>
                <div className="text-center leading-tight px-1">
                  <span className="text-[10px] text-neutral-400 uppercase font-mono block">Amount</span>
                  <span className="text-xs font-extrabold text-[var(--kc-ink)]">{portionAmount}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setPortionAmount((prev) => prev + 1)}
                  className="w-8 h-8 rounded-full bg-[var(--bento-sage-bg)] text-[var(--bento-sage-text)] font-bold text-sm flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
                >
                  +
                </button>
              </div>

              {/* Unit Toggle: EU vs Mtr (or Servings vs Grams) */}
              <div className="flex items-center p-1 rounded-full bg-neutral-100 dark:bg-[#122A1E] text-xs font-bold text-neutral-600 dark:text-neutral-300">
                <button
                  type="button"
                  onClick={() => setPortionUnit('EU')}
                  className={`px-3 py-1 rounded-full transition-all ${portionUnit === 'EU'
                    ? 'bg-white dark:bg-[#1C4230] text-[var(--kc-ink)] shadow-2xs'
                    : 'hover:text-neutral-900 dark:hover:text-white'
                    }`}
                >
                  EU
                </button>
                <button
                  type="button"
                  onClick={() => setPortionUnit('Mtr')}
                  className={`px-3 py-1 rounded-full transition-all ${portionUnit === 'Mtr'
                    ? 'bg-white dark:bg-[#1C4230] text-[var(--kc-ink)] shadow-2xs'
                    : 'hover:text-neutral-900 dark:hover:text-white'
                    }`}
                >
                  Mtr
                </button>
              </div>
            </div>

            {/* 3. Popular Chefs Community Bar */}
            <div className="flex items-center justify-between p-2.5 sm:p-3 rounded-full bg-neutral-950 text-white dark:bg-[#10241A] dark:border dark:border-[#1E4331] shadow-xs">
              <div className="flex items-center gap-2.5 pl-2">
                <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-xs">
                  👨‍🍳
                </div>
                <span className="text-xs font-bold">Popular chefs</span>
                <span className="text-[10px] font-mono text-neutral-400 bg-white/10 px-1.5 py-0.5 rounded-full font-bold">
                  64
                </span>
              </div>

              {/* Overlapping Chef Avatars */}
              <div className="flex -space-x-2 overflow-hidden pr-1">
                <div className="inline-block h-7 w-7 rounded-full ring-2 ring-neutral-900 bg-emerald-600 text-[10px] flex items-center justify-center font-bold text-white">
                  JC
                </div>
                <div className="inline-block h-7 w-7 rounded-full ring-2 ring-neutral-900 bg-amber-600 text-[10px] flex items-center justify-center font-bold text-white">
                  SK
                </div>
                <div className="inline-block h-7 w-7 rounded-full ring-2 ring-neutral-900 bg-rose-600 text-[10px] flex items-center justify-center font-bold text-white">
                  AL
                </div>
              </div>
            </div>

            {/* 4. Vertical Recipe Stack (Candy Pastel Pill Cards) */}
            <div className="space-y-2.5">
              {RECIPES_DATA.map((recipe, idx) => {
                const isActive = recipe.id === activeRecipeId;
                // Alternate pastel color pills matching the mockup:
                // green -> yellow -> pink -> peach
                const colorClasses = [
                  'bg-[var(--bento-sage-bg)] border-[var(--bento-sage-border)] text-[var(--bento-sage-text)]',
                  'bg-[var(--bento-butter-bg)] border-[var(--bento-butter-border)] text-[var(--bento-butter-text)]',
                  'bg-[var(--bento-rose-bg)] border-[var(--bento-rose-border)] text-[var(--bento-rose-text)]',
                  'bg-[var(--bento-peach-bg)] border-[var(--bento-peach-border)] text-[var(--bento-peach-text)]',
                ][idx % 4];

                return (
                  <div
                    key={recipe.id}
                    onClick={() => setActiveRecipeId(recipe.id)}
                    className={`cursor-pointer flex items-center justify-between p-2.5 sm:p-3 rounded-full border shadow-2xs hover:scale-102 transition-all ${colorClasses} ${isActive ? 'ring-2 ring-neutral-900 dark:ring-white scale-102 shadow-sm' : ''
                      }`}
                  >
                    <div className="pl-3 truncate leading-tight">
                      <h4 className="font-extrabold text-xs truncate max-w-[150px]">
                        {recipe.title}
                      </h4>
                      <div className="flex items-center gap-1.5 text-[10px] font-semibold opacity-75 mt-0.5">
                        <span>⏱</span>
                        <span>{recipe.timeMin} min</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <div className="relative w-10 h-10 rounded-full overflow-hidden border border-white/60 dark:border-black/30 shadow-2xs">
                        <Image
                          src={recipe.image}
                          alt={recipe.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <button
                        type="button"
                        aria-label={`Select ${recipe.title}`}
                        className="w-7 h-7 rounded-full bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 flex items-center justify-center text-xs font-bold hover:scale-110 transition-transform"
                      >
                        &gt;
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Active Step Cooking Instructions Drawer/Bar */}
        <section
          aria-label="Active Cooking Step Guidance"
          className="p-5 rounded-3xl bg-white dark:bg-[#0E2219] border border-neutral-200/90 dark:border-[#1A3D2D] shadow-sm flex flex-col md:flex-row items-center justify-between gap-4"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[var(--bento-sage-bg)] text-[var(--bento-sage-text)] border border-[var(--bento-sage-border)] flex items-center justify-center font-extrabold text-base shrink-0">
              {activeStep}
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 font-bold block">
                Step {activeStep} of 3 · {activeRecipe.title}
              </span>
              <p className="text-xs sm:text-sm font-semibold text-[var(--kc-ink)] mt-0.5">
                {activeRecipe.steps[activeStep - 1] || activeRecipe.steps[0]}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0 w-full md:w-auto">
            <Link
              href="/en/recipes"
              className="flex-1 md:flex-none text-center px-5 py-2.5 rounded-full border border-neutral-300 dark:border-[#1F4532] text-xs font-bold text-[var(--kc-ink)] hover:bg-neutral-100 dark:hover:bg-[#122A1E] transition-colors"
            >
              Browse All Recipes
            </Link>
            <Link
              href="/en/shopping-list"
              className="flex-1 md:flex-none text-center px-5 py-2.5 rounded-full bg-neutral-900 text-white dark:bg-[#22B282] dark:text-[#061A12] text-xs font-bold hover:opacity-90 transition-opacity shadow-sm"
            >
              Check Missing Pantry Items →
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
