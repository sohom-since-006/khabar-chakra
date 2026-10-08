# PHASE 4 SPEC — Household Food Intelligence & Private Pantry (Pivot)

> **Version 2.0** · Status: **Pivoted to 100% Domestic Household Food Intelligence**
> **Supersedes:** Legacy v1.0 Community Share spec. Governed by AGENTS.md v2.0 and PRD v2.0.
> **Scope:** Khabar Chakra has completely eliminated public food sharing, public map pins, pickup verification codes, donor contact reveals, event surplus feeds, and NGO accreditation. The platform is dedicated strictly to personal kitchen inventory, smart freshness triage, duplicate grocery prevention, and domestic ₹ savings analytics.

---

## 1. Core Decisions & Pivot Architecture

| Legacy Feature (v1.0) | Current Architecture (v2.0) | Rationale |
|---|---|---|
| Public food listings (`/share/new`) | Private inventory intake (`/inventory/add`) | Household privacy; domestic waste prevention at home. |
| Available food feed & map (`/available`) | "Use This First" smart shelf (`/inventory`) | Focus on prioritizing items about to spoil in the domestic kitchen. |
| Contact reveal & pickup codes (`reveal_contact`) | Deprecated (`410 Gone`) | Zero stranger interaction or public handovers; private domestic pantry. |
| Event pre-announcements | "Before You Buy" shopping assistant (`/shopping-list`) | Proactive grocery planning to stop duplicate purchases. |
| NGO verification badges | Household Zero-Waste streak & ₹ savings | Domestic household focus; ₹0 operating cost. |

---

## 2. Household Modules Implemented

1. **Multi-Zone Inventory (`/[locale]/inventory`):**
   - Segregated zones: Fridge, Freezer, and Pantry.
   - Quick manual entry and on-device receipt/barcode intake.
   - Dynamic freshness bands: 🟢 Fresh, 🟡 Consume soon, 🔴 Expiring (<24h left).
2. **"Use This First" Smart Shelf:**
   - Real-time priority queue sorting items by imminent expiration.
   - Direct shortcut to Recipe Rescue to turn expiring items into complete meals.
3. **"Before You Buy" Grocery Intelligence (`/[locale]/shopping-list`):**
   - Active cross-referencing against home inventory.
   - Warns users if they plan to purchase ingredients they already have in stock.
4. **Private Security & RLS:**
   - Enforced by Supabase Row-Level Security: `auth.uid() = owner_id`.
   - Domestic inventory data is strictly private to each authenticated account.
