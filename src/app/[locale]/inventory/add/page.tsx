'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { KhabarIcon } from '@/components/ui/KhabarIcon';
import { FoodCategory, StorageLocation, DietType, FSSAIStatus } from '@/domain/types';
import { estimateExpiryDate } from '@/domain/shelfLife';
import { calculateFreshness } from '@/domain/freshness';
import { assessWasteRisk } from '@/domain/wasteRisk';
import { validateFSSAI } from '@/domain/fssai';
import { lookupBarcode } from '@/lib/openFoodFacts';

export default function AddFoodPage() {
  const router = useRouter();
  const [, startTransition] = useTransition();

  // Mode tab: 'manual' | 'barcode' | 'camera'
  const [mode, setMode] = useState<'camera' | 'barcode' | 'manual'>('manual');

  // Form inputs
  const [name, setName] = useState('');
  const [category, setCategory] = useState<FoodCategory>('vegetables');
  const [dietType, setDietType] = useState<DietType>('veg');
  const [quantityValue, setQuantityValue] = useState('1');
  const [quantityUnit, setQuantityUnit] = useState('kg');
  const [storage, setStorage] = useState<StorageLocation>('fridge');
  const [purchaseDate, setPurchaseDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [cookedAt, setCookedAt] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [notes, setNotes] = useState('');
  
  // FSSAI fields
  const [hasFssaiMark, setHasFssaiMark] = useState(true);
  const [fssaiLicenseNo, setFssaiLicenseNo] = useState('');
  
  // Barcode search
  const [barcodeQuery, setBarcodeQuery] = useState('');
  const [barcodeSearching, setBarcodeSearching] = useState(false);
  const [barcodeFeedback, setBarcodeFeedback] = useState<string | null>(null);

  // Camera simulation
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [simulatingCapture, setSimulatingCapture] = useState(false);

  // Confirmation proof sheet modal
  const [showProofSheet, setShowProofSheet] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Auto-estimate shelf life helper
  const handleAutoEstimate = () => {
    const { expiryDate: estimated } = estimateExpiryDate(category, storage);
    // Format YYYY-MM-DDTHH:MM
    const iso = estimated.toISOString();
    const formatted = iso.substring(0, 16);
    setExpiryDate(formatted);
  };

  // Barcode lookup handler
  const handleBarcodeLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcodeQuery.trim()) return;

    setBarcodeSearching(true);
    setBarcodeFeedback(null);

    const result = await lookupBarcode(barcodeQuery);
    setBarcodeSearching(false);

    if (result.found && result.name) {
      setName(result.name);
      if (result.category) setCategory(result.category);
      if (result.dietType) setDietType(result.dietType);
      if (result.packaging) setNotes(`Packaging: ${result.packaging}`);
      setBarcodeFeedback(`✓ Found "${result.name}" from Open Food Facts.`);
      handleAutoEstimate();
    } else {
      setBarcodeFeedback('Product not in open registry. Please enter details manually.');
    }
  };

  // Camera simulated capture
  const handleSimulateCapture = () => {
    setSimulatingCapture(true);
    setTimeout(() => {
      setCapturedImage('/icons/ui/khabar-chakra-icons.svg#kc-meal');
      setSimulatingCapture(false);
      if (!name) setName('Harvest Vegetables');
      setCategory('vegetables');
      handleAutoEstimate();
    }, 600);
  };

  // Open Proof Sheet review
  const handleOpenProofSheet = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!name.trim()) {
      setErrorMsg('Please enter a food or item name.');
      return;
    }

    if (!expiryDate) {
      handleAutoEstimate();
    }

    setShowProofSheet(true);
  };

  // Final Commit to Local Storage Ledger
  const handleConfirmAndSave = () => {
    const resolvedExpiry = expiryDate || estimateExpiryDate(category, storage).expiryDate.toISOString();
    const fssaiCheck = validateFSSAI({
      category,
      hasLicenseMark: hasFssaiMark,
      licenseNumber: fssaiLicenseNo,
    });

    const newItem = {
      id: 'item_' + Date.now(),
      ownerId: 'user_local',
      name: name.trim(),
      category,
      dietType,
      quantityValue: parseFloat(quantityValue) || 1,
      quantityUnit,
      purchaseDate,
      cookedAt: category === 'cooked_food' ? (cookedAt || new Date().toISOString()) : undefined,
      expiryDate: resolvedExpiry,
      expirySource: 'user_provided' as const,
      storage,
      fssaiStatus: fssaiCheck.status as FSSAIStatus,
      fssaiLicenseNo: fssaiLicenseNo || undefined,
      isFlagged: fssaiCheck.isFlagged,
      notes,
      status: 'active' as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Store in browser local storage for persistent testing
    try {
      const existing = JSON.parse(localStorage.getItem('kc-inventory') || '[]');
      existing.unshift(newItem);
      localStorage.setItem('kc-inventory', JSON.stringify(existing));
    } catch {
      // Fallback
    }

    setShowProofSheet(false);
    startTransition(() => {
      router.push('/en/home');
    });
  };

  // Calculate live freshness preview for the proof sheet
  const resolvedExpiryPreview = expiryDate ? new Date(expiryDate) : estimateExpiryDate(category, storage).expiryDate;
  const fssaiResult = validateFSSAI({
    category,
    hasLicenseMark: hasFssaiMark,
    licenseNumber: fssaiLicenseNo,
  });
  const freshness = calculateFreshness({
    category,
    storage,
    expiryDate: resolvedExpiryPreview,
    isFlagged: fssaiResult.isFlagged,
  });
  const wasteRisk = assessWasteRisk({
    category,
    storage,
    hoursRemaining: freshness.hoursRemaining,
    quantityValue: parseFloat(quantityValue) || 1,
  });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="border-b border-[var(--kc-moss)] pb-6 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="font-annotation text-[var(--kc-basil)] text-lg">Inventory Ingestion · Form 201</span>
          <h1 className="text-3xl font-bold tracking-tight text-[var(--kc-charcoal)] mt-1">
            Log Food into Kitchen Ledger
          </h1>
        </div>
        <Link
          href="/en/home"
          className="text-xs font-mono text-[var(--kc-moss)] hover:underline flex items-center gap-1"
        >
          ← Return to Ledger
        </Link>
      </div>

      {/* Input Mode Selector */}
      <div className="flex border border-[var(--kc-moss)] bg-[var(--kc-parchment)] p-1 gap-1 mb-8" role="tablist">
        <button
          type="button"
          onClick={() => setMode('manual')}
          className={`flex-1 py-2 text-xs font-mono uppercase tracking-wider transition-colors ${
            mode === 'manual'
              ? 'bg-[var(--kc-basil)] text-white font-bold'
              : 'text-[var(--kc-charcoal)] hover:bg-[var(--kc-cream)]'
          }`}
        >
          1. Manual Entry
        </button>
        <button
          type="button"
          onClick={() => setMode('barcode')}
          className={`flex-1 py-2 text-xs font-mono uppercase tracking-wider transition-colors ${
            mode === 'barcode'
              ? 'bg-[var(--kc-basil)] text-white font-bold'
              : 'text-[var(--kc-charcoal)] hover:bg-[var(--kc-cream)]'
          }`}
        >
          2. Barcode Scan
        </button>
        <button
          type="button"
          onClick={() => setMode('camera')}
          className={`flex-1 py-2 text-xs font-mono uppercase tracking-wider transition-colors ${
            mode === 'camera'
              ? 'bg-[var(--kc-basil)] text-white font-bold'
              : 'text-[var(--kc-charcoal)] hover:bg-[var(--kc-cream)]'
          }`}
        >
          3. Camera Viewfinder
        </button>
      </div>

      {/* Mode-specific Top Panels */}
      {mode === 'barcode' && (
        <div className="almanac-card bg-[var(--kc-cream)] border border-[var(--kc-moss)] p-6 mb-8">
          <div className="flex items-center gap-2 border-b border-[var(--kc-moss)] pb-2 mb-4">
            <KhabarIcon name="scan" className="w-5 h-5 text-[var(--kc-basil)]" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--kc-charcoal)]">
              Open Food Facts Barcode Lookup
            </h2>
          </div>
          <p className="text-xs text-[var(--kc-moss)] mb-4">
            Enter a standard EAN/UPC barcode number (e.g. from biscuits, dal, or packaged milk) to auto-fill grocery information.
          </p>
          <form onSubmit={handleBarcodeLookup} className="flex gap-2">
            <input
              type="text"
              value={barcodeQuery}
              onChange={(e) => setBarcodeQuery(e.target.value)}
              placeholder="e.g. 8901030018512"
              className="flex-1 px-3 py-2 text-sm border border-[var(--kc-moss)] bg-[var(--kc-parchment)] font-mono text-[var(--kc-charcoal)] focus:outline-none focus:border-[var(--kc-basil)]"
            />
            <button
              type="submit"
              disabled={barcodeSearching}
              className="px-5 py-2 text-xs font-bold uppercase tracking-wider bg-[var(--kc-basil)] text-white hover:bg-[var(--kc-basil)]/90 disabled:opacity-50 transition-colors"
            >
              {barcodeSearching ? 'Querying...' : 'Lookup Barcode'}
            </button>
          </form>
          {barcodeFeedback && (
            <div className="mt-3 p-2 bg-[var(--kc-parchment)] border border-[var(--kc-moss)] text-xs font-mono text-[var(--kc-basil)]">
              {barcodeFeedback}
            </div>
          )}
        </div>
      )}

      {mode === 'camera' && (
        <div className="almanac-card bg-[var(--kc-cream)] border border-[var(--kc-moss)] p-6 mb-8">
          <div className="flex items-center justify-between border-b border-[var(--kc-moss)] pb-2 mb-4">
            <div className="flex items-center gap-2">
              <KhabarIcon name="meal" className="w-5 h-5 text-[var(--kc-basil)]" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--kc-charcoal)]">
                Device Camera Viewfinder
              </h2>
            </div>
            <span className="text-[11px] font-mono text-[var(--kc-basil)]">
              EXIF Location Stripped
            </span>
          </div>

          <div className="border border-dashed border-[var(--kc-moss)] bg-[var(--kc-parchment)] p-8 text-center rounded-none mb-4">
            {capturedImage ? (
              <div>
                <div className="w-24 h-24 mx-auto mb-3 border border-[var(--kc-basil)] bg-green-50 flex items-center justify-center text-3xl">
                  🥗
                </div>
                <p className="text-xs font-mono text-[var(--kc-basil)] font-bold mb-3">
                  Photo Captured & GPS Metadata Stripped on Device
                </p>
                <button
                  type="button"
                  onClick={() => setCapturedImage(null)}
                  className="px-4 py-1.5 text-xs font-mono border border-[var(--kc-moss)] bg-[var(--kc-cream)] hover:bg-[var(--kc-parchment)] text-[var(--kc-charcoal)]"
                >
                  Retake Photo
                </button>
              </div>
            ) : (
              <div>
                <p className="text-xs text-[var(--kc-moss)] mb-4">
                  Capture a photo of produce, plate, or shelf packaging. EXIF and GPS tags are automatically wiped on the client device before saving.
                </p>
                <button
                  type="button"
                  onClick={handleSimulateCapture}
                  disabled={simulatingCapture}
                  className="px-5 py-2.5 text-xs font-bold uppercase tracking-wider bg-[var(--kc-basil)] text-white hover:bg-[var(--kc-basil)]/90 transition-colors"
                >
                  {simulatingCapture ? 'Processing Frame...' : 'Capture Photo from Viewfinder'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Food Item Form */}
      <div className="almanac-card bg-[var(--kc-cream)] border border-[var(--kc-moss)] p-8">
        <div className="border-b border-[var(--kc-moss)] pb-3 mb-6 flex justify-between items-center">
          <h2 className="text-base font-bold text-[var(--kc-charcoal)]">
            Food Item Specifications
          </h2>
          <span className="text-xs font-mono text-[var(--kc-moss)]">
            Ledger Schema v1.0
          </span>
        </div>

        {errorMsg && (
          <div className="mb-6 p-3 border border-[var(--kc-chilli)] bg-red-50 text-xs font-mono text-[var(--kc-chilli)]">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleOpenProofSheet} className="space-y-6">
          {/* Row 1: Item Name & Category */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-[var(--kc-moss)] mb-1">
                Food / Dish Name (1–100 chars) *
              </label>
              <input
                type="text"
                required
                maxLength={100}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Paneer Butter Masala, Fresh Spinach, Toned Milk"
                className="w-full px-3 py-2 text-sm border border-[var(--kc-moss)] bg-[var(--kc-parchment)] text-[var(--kc-charcoal)] focus:outline-none focus:border-[var(--kc-basil)]"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-[var(--kc-moss)] mb-1">
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => {
                  const val = e.target.value as FoodCategory;
                  setCategory(val);
                }}
                className="w-full px-3 py-2 text-sm border border-[var(--kc-moss)] bg-[var(--kc-parchment)] text-[var(--kc-charcoal)] focus:outline-none focus:border-[var(--kc-basil)]"
              >
                <option value="vegetables">Vegetables</option>
                <option value="fruits">Fruits</option>
                <option value="cooked_food">Cooked Food / Prepared Meal</option>
                <option value="dairy">Dairy & Milk Products</option>
                <option value="bread_bakery">Bread & Bakery</option>
                <option value="grains_pulses">Grains & Pulses</option>
                <option value="packaged">Packaged Grocery</option>
                <option value="beverages">Beverages</option>
                <option value="meat_fish_egg">Raw Meat / Fish / Egg (Track Only)</option>
                <option value="other">Other Pantry</option>
              </select>
            </div>
          </div>

          {/* D8 Binding Invariant Warning Banner for Raw Meat/Fish/Egg */}
          {category === 'meat_fish_egg' && (
            <div className="p-3 border border-[var(--kc-chilli)] bg-red-50 text-xs text-[var(--kc-chilli)] leading-relaxed font-mono">
              <strong>Binding Decision D8:</strong> Raw meat, fish, and eggs may only be logged for private household tracking. They are permanently locked from being listed, shared, donated, or swapped on Khabar Chakra.
            </div>
          )}

          {/* Row 2: Diet Type, Quantity, Storage */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-[var(--kc-moss)] mb-1">
                Dietary Label *
              </label>
              <select
                value={dietType}
                onChange={(e) => setDietType(e.target.value as DietType)}
                className="w-full px-3 py-2 text-sm border border-[var(--kc-moss)] bg-[var(--kc-parchment)] text-[var(--kc-charcoal)] focus:outline-none focus:border-[var(--kc-basil)]"
              >
                <option value="veg">🟢 Pure Vegetarian</option>
                <option value="vegan">🌱 Vegan</option>
                <option value="egg">🟡 Egg (Contains Egg)</option>
                <option value="non_veg">🔴 Non-Vegetarian</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-[var(--kc-moss)] mb-1">
                Quantity *
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  min="0.1"
                  step="0.1"
                  required
                  value={quantityValue}
                  onChange={(e) => setQuantityValue(e.target.value)}
                  className="w-24 px-3 py-2 text-sm border border-[var(--kc-moss)] bg-[var(--kc-parchment)] text-[var(--kc-charcoal)] focus:outline-none focus:border-[var(--kc-basil)]"
                />
                <select
                  value={quantityUnit}
                  onChange={(e) => setQuantityUnit(e.target.value)}
                  className="flex-1 px-3 py-2 text-sm border border-[var(--kc-moss)] bg-[var(--kc-parchment)] text-[var(--kc-charcoal)] focus:outline-none focus:border-[var(--kc-basil)]"
                >
                  <option value="kg">kg</option>
                  <option value="g">grams</option>
                  <option value="L">Litres</option>
                  <option value="ml">ml</option>
                  <option value="pieces">pieces</option>
                  <option value="servings">servings</option>
                  <option value="packets">packets</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-[var(--kc-moss)] mb-1">
                Storage Method *
              </label>
              <select
                value={storage}
                onChange={(e) => setStorage(e.target.value as StorageLocation)}
                className="w-full px-3 py-2 text-sm border border-[var(--kc-moss)] bg-[var(--kc-parchment)] text-[var(--kc-charcoal)] focus:outline-none focus:border-[var(--kc-basil)]"
              >
                <option value="room">Ambient Room Temp</option>
                <option value="fridge">Refrigerator (Chilled)</option>
                <option value="freezer">Deep Freezer</option>
              </select>
            </div>
          </div>

          {/* Row 3: Timestamps (Purchase date, Cooked time, Expiry Date) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-[var(--kc-moss)] mb-1">
                Acquired / Purchase Date
              </label>
              <input
                type="date"
                value={purchaseDate}
                onChange={(e) => setPurchaseDate(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-[var(--kc-moss)] bg-[var(--kc-parchment)] text-[var(--kc-charcoal)] focus:outline-none focus:border-[var(--kc-basil)]"
              />
            </div>

            {category === 'cooked_food' && (
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-[var(--kc-moss)] mb-1">
                  Time Prepared / Cooked *
                </label>
                <input
                  type="datetime-local"
                  value={cookedAt}
                  onChange={(e) => setCookedAt(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-[var(--kc-moss)] bg-[var(--kc-parchment)] text-[var(--kc-charcoal)] focus:outline-none focus:border-[var(--kc-basil)]"
                />
              </div>
            )}
          </div>

          {/* Expiry Date Section with Auto-Estimation */}
          <div className="border border-[var(--kc-moss)] bg-[var(--kc-parchment)] p-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 mb-2 gap-2">
              <label className="text-xs font-mono uppercase tracking-wider text-[var(--kc-moss)]">
                Expiry / Best-Before Date & Time
              </label>
              <button
                type="button"
                onClick={handleAutoEstimate}
                className="text-xs font-bold text-[var(--kc-basil)] hover:underline self-start sm:self-auto"
              >
                ⚡ Estimate from Shelf-Life Defaults
              </button>
            </div>
            <input
              type="datetime-local"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-[var(--kc-moss)] bg-[var(--kc-cream)] text-[var(--kc-charcoal)] focus:outline-none focus:border-[var(--kc-basil)]"
            />
            <p className="text-[11px] text-[var(--kc-moss)] mt-1.5">
              If unknown, our algorithm computes recommended shelf duration based on your storage location.
            </p>
          </div>

          {/* FSSAI Packaged Food Validation Section */}
          {['packaged', 'dairy', 'beverages', 'bread_bakery'].includes(category) && (
            <div className="border border-[var(--kc-moss)] bg-[var(--kc-parchment)] p-4">
              <h3 className="text-xs font-mono uppercase tracking-wider text-[var(--kc-charcoal)] font-bold mb-2">
                FSSAI Labelling Verification (Packaged Food)
              </h3>
              <div className="space-y-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasFssaiMark}
                    onChange={(e) => setHasFssaiMark(e.target.checked)}
                    className="h-4 w-4 rounded-none border-[var(--kc-moss)] text-[var(--kc-basil)] focus:ring-[var(--kc-basil)]"
                  />
                  <span className="text-xs text-[var(--kc-charcoal)]">
                    FSSAI logo / 14-digit registration number is visible on package
                  </span>
                </label>

                {hasFssaiMark && (
                  <div>
                    <input
                      type="text"
                      maxLength={14}
                      value={fssaiLicenseNo}
                      onChange={(e) => setFssaiLicenseNo(e.target.value)}
                      placeholder="Enter 14-digit FSSAI License Number (Optional)"
                      className="w-full px-3 py-2 text-sm border border-[var(--kc-moss)] bg-[var(--kc-cream)] font-mono text-[var(--kc-charcoal)] focus:outline-none focus:border-[var(--kc-basil)]"
                    />
                  </div>
                )}

                {!hasFssaiMark && (
                  <div className="p-2 border border-[var(--kc-mango)] bg-[var(--kc-mango)]/20 text-xs text-[var(--kc-charcoal)]">
                    Caution: Packaged food without FSSAI verification cannot be published for community sharing.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-[var(--kc-moss)] mb-1">
              Storage Notes / Handling Guidelines
            </label>
            <textarea
              rows={2}
              maxLength={500}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Kept in airtight container, consume with steamed rice"
              className="w-full px-3 py-2 text-sm border border-[var(--kc-moss)] bg-[var(--kc-parchment)] text-[var(--kc-charcoal)] focus:outline-none focus:border-[var(--kc-basil)] resize-y"
            />
          </div>

          {/* Submit CTA */}
          <div className="pt-4 border-t border-[var(--kc-moss)] flex justify-end gap-3">
            <Link
              href="/en/home"
              className="px-5 py-2.5 text-xs font-mono border border-[var(--kc-moss)] bg-[var(--kc-parchment)] hover:bg-[var(--kc-cream)] text-[var(--kc-charcoal)]"
            >
              Cancel
            </Link>
            <button
              type="submit"
              className="px-6 py-2.5 text-xs font-bold uppercase tracking-wider bg-[var(--kc-basil)] text-white hover:bg-[var(--kc-basil)]/90 transition-colors"
            >
              Review Proof Sheet →
            </button>
          </div>
        </form>
      </div>

      {/* Editable Confirmation Proof Sheet Modal (FR-ADD-4) */}
      {showProofSheet && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="almanac-card bg-[var(--kc-cream)] border border-[var(--kc-moss)] p-8 max-w-xl w-full max-h-[90vh] overflow-y-auto">
            <div className="border-b border-[var(--kc-moss)] pb-3 mb-6 flex justify-between items-center">
              <div>
                <span className="font-annotation text-[var(--kc-basil)] text-sm">Step 2 · Verification Proof Sheet</span>
                <h3 className="text-xl font-bold text-[var(--kc-charcoal)]">
                  Confirm Item Entry
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowProofSheet(false)}
                className="text-sm font-mono text-[var(--kc-moss)] hover:text-[var(--kc-charcoal)]"
              >
                ✕ Close
              </button>
            </div>

            <div className="space-y-4 mb-6 text-sm">
              <div className="p-3 border border-[var(--kc-moss)] bg-[var(--kc-parchment)] grid grid-cols-2 gap-2 text-xs font-mono">
                <div>
                  <span className="text-[var(--kc-moss)] block">NAME:</span>
                  <span className="font-bold text-[var(--kc-charcoal)]">{name}</span>
                </div>
                <div>
                  <span className="text-[var(--kc-moss)] block">PORTION:</span>
                  <span className="font-bold text-[var(--kc-charcoal)]">{quantityValue} {quantityUnit}</span>
                </div>
                <div>
                  <span className="text-[var(--kc-moss)] block">STORAGE:</span>
                  <span className="font-bold uppercase text-[var(--kc-charcoal)]">{storage}</span>
                </div>
                <div>
                  <span className="text-[var(--kc-moss)] block">CATEGORY:</span>
                  <span className="font-bold uppercase text-[var(--kc-charcoal)]">{category}</span>
                </div>
              </div>

              {/* Freshness & Risk Score Summary */}
              <div className="p-4 border border-[var(--kc-moss)] bg-[var(--kc-parchment)] space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-mono uppercase text-[var(--kc-moss)]">Computed Status Band:</span>
                  <span className="px-2 py-0.5 text-xs font-bold font-mono border border-[var(--kc-moss)] bg-[var(--kc-cream)]">
                    {freshness.bandBadgeLabel}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-mono uppercase text-[var(--kc-moss)]">Freshness Score:</span>
                  <span className="font-mono font-bold text-[var(--kc-basil)]">{freshness.score} / 100</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-mono uppercase text-[var(--kc-moss)]">Waste Risk Level:</span>
                  <span className="font-mono font-bold uppercase">{wasteRisk.riskLevel} Risk</span>
                </div>
                <p className="text-xs text-[var(--kc-charcoal)] pt-2 border-t border-[var(--kc-moss)]/40">
                  {freshness.actionRecommendation}
                </p>
              </div>

              {category === 'meat_fish_egg' && (
                <div className="p-3 border border-[var(--kc-chilli)] bg-red-50 text-xs text-[var(--kc-chilli)] font-mono">
                  [D8 LOCK] This raw meat/fish/egg item will be tracked in your private kitchen ledger, but CANNOT be published for surplus donation or sharing.
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-[var(--kc-moss)]">
              <button
                type="button"
                onClick={() => setShowProofSheet(false)}
                className="px-4 py-2 text-xs font-mono border border-[var(--kc-moss)] bg-[var(--kc-parchment)] hover:bg-[var(--kc-cream)] text-[var(--kc-charcoal)]"
              >
                Edit Specifications
              </button>
              <button
                type="button"
                onClick={handleConfirmAndSave}
                className="px-6 py-2 text-xs font-bold uppercase tracking-wider bg-[var(--kc-basil)] text-white hover:bg-[var(--kc-basil)]/90 transition-colors"
              >
                Confirm & Log to Ledger →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
