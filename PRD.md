# PRD — Khabar Chakra (খাবার চক্র)

> **Product Requirements Document** · **Version 2.0** · Status: **Pivot to Personal Household Food Lifecycle & Waste Prevention**
> Supersedes v1.1. Single source of truth: AGENTS.md (v2.0).
> **Tagline:** Smart Food Tracking • Zero Waste • Household Savings · **Team:** The S-QUAD, Asansol Engineering College

---

## 0. Executive Summary & Core Pivot
Khabar Chakra (*Khabar* = food, *Chakra* = cycle) has pivoted 100% to **individual households, home kitchens, and personal food-freshness lifecycle management**.

All public food donation, surplus sharing feeds, map-based pickup pins, event pre-announcements (weddings/caterers), and external NGO document verifications are **permanently removed**. 

Instead, Khabar Chakra doubles down on delivering **the most intuitive, beautiful, and intelligent domestic zero-waste kitchen platform** with ₹0 operating cost:
`Buy / Scan Receipt → Multi-Zone Inventory → Real-Time Freshness Triage → "Use This First" Smart Shelf → "Before You Buy" Duplicate Prevention → Recipe Rescue from Expiring Pantry Items → Personal ₹ Savings & Waste Reduction Analytics`

---

## 1. The 5 Core Product Pillars

### Pillar 1: Advanced Intake & Multi-Zone Inventory
- **Multi-Zone Storage:** Segregate items into Fridge (with Crisper), Pantry (dry staples), and Freezer.
- **OCR Grocery Receipt & Label Parsing:** Client-side OCR (Tesseract / vision heuristics) reads bills, extracting item names, purchase dates, and expiry/batch dates in one click.
- **Barcode Lookup:** Open Food Facts integration for instant nutrition and packaging categorization without manual typing.
- **Automatic Shelf-Life Prediction:** Intelligent defaults for produce, dairy, grains, and cooked dishes based on storage conditions.

### Pillar 2: Dynamic Freshness & "Use This First" Smart Shelf
- **Mathematical Freshness Scoring:** Real-time 0–100% decay score based on category and remaining hours.
- **Color-Coded Urgency Tiers:**
  - 🟢 **Fresh** (> 48 hours remaining)
  - 🟡 **Consume Soon** (24–48 hours remaining)
  - 🔴 **Immediate Attention / Use This First** (< 24 hours remaining)
- **Dynamic Kitchen Risk Score:** Gauges the percentage of household food safely preserved versus approaching expiry.

### Pillar 3: "Before You Buy" Shopping Assistant
- **Real-Time Cross-Checking:** When planning grocery purchases at the bazaar or supermarket, users enter items to check against their existing home stock.
- **Duplicate Prevention Warning:** "⚠️ You already have 1 L Milk in your Fridge (~10h left)!"
- **Smart Verified Shopping List:** Converts needed missing items into an interactive checklist that moves directly into home inventory upon purchase.

### Pillar 4: Recipe Rescue & Meal Planning
- **Zero-Waste Recipe Engine:** Synthesizes custom Indian and global recipes specifically utilizing ingredients flagged as "Consume Soon" or "Expiring".
- **Nutritional & Macro Tracking:** Estimates calories, protein, carbohydrates, and fats for meals prepared from saved pantry leftovers.

### Pillar 5: Personal Household Waste & ₹ Savings Analytics
- **Domestic Savings Tracker:** Calculates the exact monetary value (in ₹) saved by eating food before expiration instead of throwing it away.
- **Environmental Impact:** Measures kilograms of food diverted from municipal landfill and domestic CO₂e emissions prevented.
- **Household Streak System:** Encourages long-term zero-waste habits with daily streak counters (e.g. 14-day zero waste streak).

---

## 2. Authentication & Privacy
- **Supabase Google OAuth:** Native 1-click Google Sign In integrated with Supabase Auth, with email/password fallback.
- **No Mock or Fake Users:** Real Google profile names, avatars, and session metadata; unauthenticated states display clean "Sign In" prompts with `eg. Home Chef` context.
- **Strict Row-Level Security (RLS):** All kitchen inventories, recipes, and shopping lists are strictly private to `auth.uid() = owner_id`. No public visibility or sharing of personal domestic pantries.

---

## 3. Tech Stack
- **Framework:** Next.js (App Router, Next.js 16 line) + React 19 + TypeScript (`strict`).
- **Styling & Motion:** Tailwind CSS + High-Contrast Kitchen Almanac palette with persistent Light/Dark mode switcher and ambient canvas particle system.
- **Typography:** Montserrat (body and structure), Sacramento & Great Vibes (cursive titles and accents), Yellowtail & Bad Script (badges and stamps).
- **Backend & Database:** Supabase (Postgres, Row Level Security, Auth, Storage).
- **OCR & Scanner:** Tesseract.js client-side OCR + Open Food Facts API.
- **Cost:** ₹0 strictly maintained across all services and dependencies.