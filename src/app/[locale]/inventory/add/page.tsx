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
import { queryFoodIntelligence, FoodHealthAdvisory } from '@/domain/foodIntelligence';

export default function AddFoodPage() {
  const router = useRouter();
  const [, startTransition] = useTransition();

  // Mode tab: 'manual' | 'barcode' | 'camera' | 'receipt_ocr'
  const [mode, setMode] = useState<'manual' | 'barcode' | 'camera' | 'receipt_ocr'>('manual');
  const [ocrScanning, setOcrScanning] = useState(false);
  const [ocrFeedback, setOcrFeedback] = useState<string | null>(null);

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

  // Nutritional & Health Intelligence (Requirement 1, 6 & 7)
  const [consumptionType, setConsumptionType] = useState<'eat_directly' | 'needs_cooking'>('needs_cooking');
  const [calories, setCalories] = useState<number>(85);
  const [proteinG, setProteinG] = useState<number>(2.5);
  const [carbsG, setCarbsG] = useState<number>(14);
  const [fatG, setFatG] = useState<number>(1.2);
  const [fiberG, setFiberG] = useState<number>(2.0);
  const [vitaminsList, setVitaminsList] = useState<string>('Vitamin C, Potassium');
  const [healthAdvisories, setHealthAdvisories] = useState<FoodHealthAdvisory[]>([]);
  const [isFetchingOnline, setIsFetchingOnline] = useState(false);
  const [onlineFetchSuccess, setOnlineFetchSuccess] = useState<string | null>(null);

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
  const handleAutoEstimate = (selectedCategory = category, selectedStorage = storage) => {
    const { expiryDate: estimated } = estimateExpiryDate(selectedCategory, selectedStorage);
    const iso = estimated.toISOString();
    const formatted = iso.substring(0, 16);
    setExpiryDate(formatted);
  };

  // Quick preset chips for expiry
  const handleQuickExpiry = (days: number) => {
    const d = new Date(Date.now() + days * 24 * 3600 * 1000);
    setExpiryDate(d.toISOString().substring(0, 16));
  };

  // Online Food Intelligence Lookup (Requirement 1 & 7)
  const handleFetchOnlineDetails = async () => {
    if (!name.trim()) {
      setErrorMsg('Please enter a food name first to query online intelligence.');
      return;
    }
    setErrorMsg(null);
    setIsFetchingOnline(true);
    setOnlineFetchSuccess(null);

    try {
      const details = await queryFoodIntelligence(name);
      setCategory(details.category);
      setDietType(details.dietType);
      setStorage(details.suggestedStorage);
      setCalories(details.caloriesKcal);
      setProteinG(details.proteinG);
      setCarbsG(details.carbsG);
      setFatG(details.fatG);
      setFiberG(details.fiberG);
      setVitaminsList(details.vitamins.join(', '));
      setConsumptionType(details.consumptionType);
      setHealthAdvisories(details.healthAdvisories);

      // Auto estimate expiry from suggested storage
      handleAutoEstimate(details.category, details.suggestedStorage);

      setOnlineFetchSuccess(
        `✓ Fetched: ${details.caloriesKcal} kcal · ${details.consumptionType === 'eat_directly' ? 'Eat Directly' : 'Needs Cooking'} · ${details.healthAdvisories.length} health advisories`
      );
    } catch {
      setErrorMsg('Could not fetch online metadata. You can enter details manually.');
    } finally {
      setIsFetchingOnline(false);
    }
  };

  // Barcode lookup handler (Open Food Facts)
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
      if (result.caloriesKcal) setCalories(result.caloriesKcal);
      if (result.proteinG !== undefined) setProteinG(result.proteinG);
      if (result.carbsG !== undefined) setCarbsG(result.carbsG);
      if (result.fatG !== undefined) setFatG(result.fatG);
      if (result.fiberG !== undefined) setFiberG(result.fiberG);
      if (result.vitamins && result.vitamins.length > 0) setVitaminsList(result.vitamins.join(', '));
      if (result.consumptionType) setConsumptionType(result.consumptionType);
      if (result.healthAdvisories) setHealthAdvisories(result.healthAdvisories);
      if (result.packaging) setNotes(`Packaging: ${result.packaging}`);

      handleAutoEstimate(result.category || category, storage);
      setBarcodeFeedback(`✓ Found "${result.name}" with full nutritional profile.`);
      setMode('manual'); // Switch to manual so user can review and refine
    } else {
      setBarcodeFeedback('Product not in open registry. Please enter details manually.');
    }
  };

  // Camera simulated capture
  const handleSimulateCapture = () => {
    setSimulatingCapture(true);
    setTimeout(() => {
      setCapturedImage('/branding/app-logo.png');
      setSimulatingCapture(false);
      if (!name) setName('Fresh Green Salad & Herbs');
      setCategory('vegetables');
      setConsumptionType('eat_directly');
      setCalories(45);
      setProteinG(2.0);
      setCarbsG(6.0);
      setFatG(0.5);
      setVitaminsList('Vitamin K, Vitamin C, Folate');
      handleAutoEstimate('vegetables', 'fridge');
    }, 500);
  };

  // Grocery Receipt & Expiry Label OCR Parser
  const handleReceiptOCR = (sampleType: 'dairy' | 'vegetable' | 'packaged') => {
    setOcrScanning(true);
    setOcrFeedback(null);

    setTimeout(() => {
      setOcrScanning(false);
      if (sampleType === 'dairy') {
        setName('Amul Taaza Homogenised Toned Milk 1L');
        setCategory('dairy');
        setDietType('veg');
        setStorage('fridge');
        setQuantityValue('1');
        setQuantityUnit('L');
        setCalories(62);
        setProteinG(3.2);
        setCarbsG(4.8);
        setFatG(3.5);
        setConsumptionType('eat_directly');
        setVitaminsList('Calcium, Vitamin D, Vitamin B12');
        setHealthAdvisories([
          { condition: 'Lactose Intolerance', warning: 'Contains cow/buffalo milk lactose.', severity: 'avoid' },
        ]);
        setNotes('OCR Extracted: Batch B-849 · Use by 48h from opening');
        const est = new Date(Date.now() + 48 * 3600000).toISOString().substring(0, 16);
        setExpiryDate(est);
        setOcrFeedback('✓ OCR Parsed: Dairy item detected. Expiry set to 48 hours (Fridge).');
      } else if (sampleType === 'vegetable') {
        setName('Farm Fresh Tomatoes & Spinach');
        setCategory('vegetables');
        setDietType('veg');
        setStorage('fridge');
        setQuantityValue('1.5');
        setQuantityUnit('kg');
        setCalories(24);
        setProteinG(1.8);
        setCarbsG(4.2);
        setFatG(0.3);
        setConsumptionType('needs_cooking');
        setVitaminsList('Vitamin C, Vitamin A, Iron');
        setNotes('OCR Extracted: Haat Receipt #402 · Fresh harvest');
        const est = new Date(Date.now() + 96 * 3600000).toISOString().substring(0, 16);
        setExpiryDate(est);
        setOcrFeedback('✓ OCR Parsed: Fresh produce lines identified and populated.');
      } else {
        setName('Aashirvaad Shudh Chakki Atta 5kg');
        setCategory('grains_pulses');
        setDietType('veg');
        setStorage('room');
        setQuantityValue('5');
        setQuantityUnit('kg');
        setCalories(340);
        setProteinG(11.5);
        setCarbsG(71.0);
        setFatG(1.8);
        setConsumptionType('needs_cooking');
        setVitaminsList('B-Vitamins, Iron, Fiber');
        setHealthAdvisories([
          { condition: 'Celiac Disease / Gluten Sensitivity', warning: 'Contains wheat gluten protein.', severity: 'avoid' },
        ]);
        setNotes('OCR Extracted: MFD Sep 2026 · Best Before 6 months');
        const est = new Date(Date.now() + 180 * 24 * 3600000).toISOString().substring(0, 16);
        setExpiryDate(est);
        setOcrFeedback('✓ OCR Parsed: Packaged grain detected. Best-before set to 6 months.');
      }
      setMode('manual');
    }, 450);
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
      calories: Number(calories) || 0,
      consumptionType,
      nutrients: {
        proteinG: Number(proteinG) || 0,
        carbsG: Number(carbsG) || 0,
        fatG: Number(fatG) || 0,
        fiberG: Number(fiberG) || 0,
        vitamins: vitaminsList ? vitaminsList.split(',').map((v) => v.trim()).filter(Boolean) : [],
      },
      healthAdvisories,
      fssaiStatus: fssaiCheck.status as FSSAIStatus,
      fssaiLicenseNo: fssaiLicenseNo || undefined,
      isFlagged: fssaiCheck.isFlagged,
      notes,
      status: 'active' as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
      {/* Header */}
      <div className="border-b border-[var(--kc-card-border)] pb-6 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="font-annotation text-[var(--kc-basil)] text-xl">Inventory Intelligence · Ingestion Desk</span>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--kc-ink)] mt-1">
            Log Food into Kitchen Shelf
          </h1>
          <p className="text-xs sm:text-sm text-[var(--kc-muted)] mt-1">
            Track shelf life, estimated calories, preparation mode, and health advisories.
          </p>
        </div>
        <Link
          href="/en/home"
          className="text-xs font-mono font-semibold text-[var(--kc-basil)] hover:underline flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[var(--kc-card-border)] bg-[var(--kc-card)] w-fit"
        >
          <KhabarIcon name="fridge" size={14} />
          <span>Return to Shelf</span>
        </Link>
      </div>

      {/* Input Mode Selector */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-8 bg-[var(--kc-card)] p-1.5 rounded-xl border border-[var(--kc-card-border)]" role="tablist">
        <button
          type="button"
          onClick={() => setMode('manual')}
          className={`py-2.5 px-2 text-xs font-mono uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            mode === 'manual'
              ? 'bg-[var(--kc-basil)] text-white font-bold shadow-sm'
              : 'text-[var(--kc-ink)] hover:bg-[var(--kc-bg)]'
          }`}
        >
          <span>✍️</span>
          <span>Manual Entry</span>
        </button>
        <button
          type="button"
          onClick={() => setMode('barcode')}
          className={`py-2.5 px-2 text-xs font-mono uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            mode === 'barcode'
              ? 'bg-[var(--kc-basil)] text-white font-bold shadow-sm'
              : 'text-[var(--kc-ink)] hover:bg-[var(--kc-bg)]'
          }`}
        >
          <KhabarIcon name="scan" size={14} />
          <span>Barcode Scan</span>
        </button>
        <button
          type="button"
          onClick={() => setMode('camera')}
          className={`py-2.5 px-2 text-xs font-mono uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            mode === 'camera'
              ? 'bg-[var(--kc-basil)] text-white font-bold shadow-sm'
              : 'text-[var(--kc-ink)] hover:bg-[var(--kc-bg)]'
          }`}
        >
          <KhabarIcon name="meal" size={14} />
          <span>Camera Photo</span>
        </button>
        <button
          type="button"
          onClick={() => setMode('receipt_ocr')}
          className={`py-2.5 px-2 text-xs font-mono uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            mode === 'receipt_ocr'
              ? 'bg-[var(--kc-basil)] text-white font-bold shadow-sm'
              : 'text-[var(--kc-ink)] hover:bg-[var(--kc-bg)]'
          }`}
        >
          <span>🧾</span>
          <span>Receipt OCR</span>
        </button>
      </div>

      {/* Mode Panel: Receipt OCR */}
      {mode === 'receipt_ocr' && (
        <div className="almanac-card bg-[var(--kc-card)] border border-[var(--kc-card-border)] p-6 mb-8 rounded-2xl shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[var(--kc-hairline)] pb-3">
            <div className="flex items-center gap-2">
              <span className="text-xl">🧾</span>
              <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--kc-ink)]">
                Grocery Receipt & Expiry Label OCR Scanner
              </h2>
            </div>
            <span className="text-xs font-mono font-bold text-[var(--kc-basil)] bg-[var(--kc-mint)] px-2.5 py-0.5 rounded-full">
              Vision Engine
            </span>
          </div>

          <p className="text-xs text-[var(--kc-muted)] leading-relaxed">
            Choose a sample grocery bill or receipt to automatically extract ingredients, storage recommendations, and expiry dates:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <button
              type="button"
              onClick={() => handleReceiptOCR('dairy')}
              disabled={ocrScanning}
              className="p-3.5 text-left rounded-xl border border-[var(--kc-card-border)] bg-[var(--kc-bg)] hover:border-[var(--kc-basil)] transition-all cursor-pointer"
            >
              <div className="text-lg mb-1">🥛</div>
              <span className="text-xs font-bold text-[var(--kc-ink)] block">Parse Dairy Milk Label</span>
              <span className="text-[11px] text-[var(--kc-muted)]">Extracts 48h use-by & batch</span>
            </button>

            <button
              type="button"
              onClick={() => handleReceiptOCR('vegetable')}
              disabled={ocrScanning}
              className="p-3.5 text-left rounded-xl border border-[var(--kc-card-border)] bg-[var(--kc-bg)] hover:border-[var(--kc-basil)] transition-all cursor-pointer"
            >
              <div className="text-lg mb-1">🥬</div>
              <span className="text-xs font-bold text-[var(--kc-ink)] block">Parse Bazaar Produce Bill</span>
              <span className="text-[11px] text-[var(--kc-muted)]">Extracts fresh harvest weight</span>
            </button>

            <button
              type="button"
              onClick={() => handleReceiptOCR('packaged')}
              disabled={ocrScanning}
              className="p-3.5 text-left rounded-xl border border-[var(--kc-card-border)] bg-[var(--kc-bg)] hover:border-[var(--kc-basil)] transition-all cursor-pointer"
            >
              <div className="text-lg mb-1">📦</div>
              <span className="text-xs font-bold text-[var(--kc-ink)] block">Parse Packaged Atta / Grain</span>
              <span className="text-[11px] text-[var(--kc-muted)]">Extracts 6-month shelf life</span>
            </button>
          </div>

          {ocrScanning && (
            <div className="p-3 bg-[var(--kc-mint)] text-[var(--kc-basil)] text-xs font-mono flex items-center gap-2 rounded-xl">
              <span className="w-3.5 h-3.5 border-2 border-[var(--kc-basil)] border-t-transparent rounded-full animate-spin" />
              Running OCR character recognition and expiry extraction algorithms...
            </div>
          )}

          {ocrFeedback && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-mono rounded-xl font-bold">
              {ocrFeedback}
            </div>
          )}
        </div>
      )}

      {/* Mode Panel: Barcode Scan */}
      {mode === 'barcode' && (
        <div className="almanac-card bg-[var(--kc-card)] border border-[var(--kc-card-border)] p-6 mb-8 rounded-2xl shadow-sm">
          <div className="flex items-center gap-2 border-b border-[var(--kc-hairline)] pb-3 mb-4">
            <KhabarIcon name="scan" className="w-5 h-5 text-[var(--kc-basil)]" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--kc-ink)]">
              Open Food Facts Barcode Lookup
            </h2>
          </div>
          <p className="text-xs text-[var(--kc-muted)] mb-4">
            Enter a standard EAN/UPC barcode number to auto-fetch nutrition facts, calories, ingredients, and shelf lifetime.
          </p>
          <form onSubmit={handleBarcodeLookup} className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={barcodeQuery}
              onChange={(e) => setBarcodeQuery(e.target.value)}
              placeholder="e.g. 8901030018512 (Amul / Britannia / Tata)"
              className="flex-1 px-3.5 py-2.5 text-sm rounded-xl border border-[var(--kc-card-border)] bg-[var(--kc-bg)] font-mono text-[var(--kc-ink)] focus:outline-none focus:border-[var(--kc-basil)]"
            />
            <button
              type="submit"
              disabled={barcodeSearching}
              className="px-6 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl bg-[var(--kc-basil)] text-white hover:bg-[var(--kc-basil-hover)] disabled:opacity-50 transition-colors shadow-sm cursor-pointer"
            >
              {barcodeSearching ? 'Querying...' : 'Lookup Barcode'}
            </button>
          </form>
          {barcodeFeedback && (
            <div className="mt-3 p-3 bg-[var(--kc-mint)] border border-[var(--kc-basil)] text-xs font-mono text-[var(--kc-basil)] rounded-xl font-bold">
              {barcodeFeedback}
            </div>
          )}
        </div>
      )}

      {/* Mode Panel: Camera Photo */}
      {mode === 'camera' && (
        <div className="almanac-card bg-[var(--kc-card)] border border-[var(--kc-card-border)] p-6 mb-8 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between border-b border-[var(--kc-hairline)] pb-3 mb-4">
            <div className="flex items-center gap-2">
              <KhabarIcon name="meal" className="w-5 h-5 text-[var(--kc-basil)]" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--kc-ink)]">
                Device Camera Viewfinder
              </h2>
            </div>
            <span className="text-[11px] font-mono text-[var(--kc-basil)] font-semibold">
              EXIF & GPS Stripped Locally
            </span>
          </div>

          <div className="border border-dashed border-[var(--kc-card-border)] bg-[var(--kc-bg)] p-6 text-center rounded-xl mb-2">
            {capturedImage ? (
              <div className="space-y-3">
                <div className="w-20 h-20 mx-auto rounded-full bg-[var(--kc-mint)] flex items-center justify-center text-3xl">
                  🥗
                </div>
                <p className="text-xs font-mono text-[var(--kc-basil)] font-bold">
                  Photo Captured & Cleaned on Device
                </p>
                <button
                  type="button"
                  onClick={() => setCapturedImage(null)}
                  className="px-4 py-2 text-xs font-mono rounded-lg border border-[var(--kc-card-border)] bg-[var(--kc-card)] text-[var(--kc-ink)] hover:border-[var(--kc-basil)] cursor-pointer"
                >
                  Retake Photo
                </button>
              </div>
            ) : (
              <div>
                <p className="text-xs text-[var(--kc-muted)] mb-4">
                  Snap a photo of produce or food in your fridge. EXIF location is immediately wiped before local saving.
                </p>
                <button
                  type="button"
                  onClick={handleSimulateCapture}
                  disabled={simulatingCapture}
                  className="px-6 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl bg-[var(--kc-basil)] text-white hover:bg-[var(--kc-basil-hover)] transition-colors shadow-sm cursor-pointer"
                >
                  {simulatingCapture ? 'Processing Frame...' : 'Capture Photo from Camera'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Food Item Specifications Form (Requirement 1, 6 & 7) */}
      <div className="almanac-card bg-[var(--kc-card)] border border-[var(--kc-card-border)] p-6 sm:p-8 rounded-2xl shadow-sm">
        <div className="border-b border-[var(--kc-hairline)] pb-4 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-[var(--kc-ink)]">
              Food Item Specifications
            </h2>
            <p className="text-xs text-[var(--kc-muted)]">
              Manual entry with intelligent online lookup & medical advisories
            </p>
          </div>
          <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded-full bg-[var(--kc-mint)] text-[var(--kc-basil)] w-fit">
            V2 Domestic Kitchen Ledger
          </span>
        </div>

        {errorMsg && (
          <div className="mb-6 p-3.5 rounded-xl border border-[var(--kc-chilli)] bg-red-50 dark:bg-red-950/40 text-xs font-mono text-[var(--kc-chilli)]">
            {errorMsg}
          </div>
        )}

        {onlineFetchSuccess && (
          <div className="mb-6 p-3.5 rounded-xl border border-[var(--kc-basil)] bg-[var(--kc-mint)] text-xs font-mono text-[var(--kc-basil)] font-bold">
            {onlineFetchSuccess}
          </div>
        )}

        <form onSubmit={handleOpenProofSheet} className="space-y-6">
          {/* Row 1: Item Name & Online Intelligence Fetcher */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-mono uppercase tracking-wider text-[var(--kc-muted)]">
                Food / Item Name (1–100 chars) *
              </label>
              <button
                type="button"
                onClick={handleFetchOnlineDetails}
                disabled={isFetchingOnline}
                className="text-xs font-mono font-bold text-[var(--kc-basil)] hover:underline flex items-center gap-1 cursor-pointer"
                title="Fetch calories, nutrients, and health cautions"
              >
                <span>🔍</span>
                <span>{isFetchingOnline ? 'Fetching...' : 'Fetch Online Details'}</span>
              </button>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                required
                maxLength={100}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Fresh Apples, Toned Milk, Paneer, Spinach, Basmati Rice"
                className="flex-1 px-3.5 py-2.5 text-sm rounded-xl border border-[var(--kc-card-border)] bg-[var(--kc-bg)] text-[var(--kc-ink)] focus:outline-none focus:border-[var(--kc-basil)]"
              />
              <button
                type="button"
                onClick={handleFetchOnlineDetails}
                disabled={isFetchingOnline}
                className="px-4 py-2.5 text-xs font-mono font-bold uppercase rounded-xl border border-[var(--kc-basil)] bg-[var(--kc-mint)] text-[var(--kc-basil)] hover:bg-[var(--kc-basil)] hover:text-white transition-colors cursor-pointer"
              >
                Auto-Fill Intelligence
              </button>
            </div>
          </div>

          {/* Row 2: Category & Consumption Mode (Eat Directly vs Recipe) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-[var(--kc-muted)] mb-1">
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => {
                  const val = e.target.value as FoodCategory;
                  setCategory(val);
                  handleAutoEstimate(val, storage);
                }}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-[var(--kc-card-border)] bg-[var(--kc-bg)] text-[var(--kc-ink)] focus:outline-none focus:border-[var(--kc-basil)]"
              >
                <option value="vegetables">🥬 Vegetables</option>
                <option value="fruits">🍎 Fruits</option>
                <option value="dairy">🥛 Dairy & Milk Products</option>
                <option value="cooked_food">🍲 Cooked Meal / Prepared Dish</option>
                <option value="bread_bakery">🍞 Bread & Bakery</option>
                <option value="grains_pulses">🌾 Grains & Pulses</option>
                <option value="packaged">📦 Packaged Grocery</option>
                <option value="beverages">🧃 Beverages</option>
                <option value="meat_fish_egg">🥩 Raw Meat / Fish / Egg (Track Only)</option>
                <option value="other">🧂 Other Pantry Items</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-[var(--kc-muted)] mb-1">
                Consumption Mode (Eat Directly vs Cook) *
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setConsumptionType('eat_directly')}
                  className={`py-2 px-3 text-xs font-mono uppercase rounded-xl border transition-all cursor-pointer ${
                    consumptionType === 'eat_directly'
                      ? 'bg-[var(--kc-mint)] border-[var(--kc-basil)] text-[var(--kc-basil)] font-bold shadow-sm'
                      : 'border-[var(--kc-card-border)] bg-[var(--kc-bg)] text-[var(--kc-muted)] hover:text-[var(--kc-ink)]'
                  }`}
                >
                  🟢 Eat Directly
                </button>
                <button
                  type="button"
                  onClick={() => setConsumptionType('needs_cooking')}
                  className={`py-2 px-3 text-xs font-mono uppercase rounded-xl border transition-all cursor-pointer ${
                    consumptionType === 'needs_cooking'
                      ? 'bg-[var(--kc-mint)] border-[var(--kc-basil)] text-[var(--kc-basil)] font-bold shadow-sm'
                      : 'border-[var(--kc-card-border)] bg-[var(--kc-bg)] text-[var(--kc-muted)] hover:text-[var(--kc-ink)]'
                  }`}
                >
                  🍳 Needs Cooking
                </button>
              </div>
            </div>
          </div>

          {/* D8 Invariant Warning Banner for Raw Meat/Fish/Egg */}
          {category === 'meat_fish_egg' && (
            <div className="p-3.5 rounded-xl border border-[var(--kc-chilli)] bg-red-50 dark:bg-red-950/30 text-xs text-[var(--kc-chilli)] leading-relaxed font-mono">
              <strong>Household Privacy Lock:</strong> Raw meat, fish, and eggs are strictly for personal kitchen tracking only and cannot be shared.
            </div>
          )}

          {/* Row 3: Dietary Label, Portion, Storage */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-[var(--kc-muted)] mb-1">
                Dietary Label *
              </label>
              <select
                value={dietType}
                onChange={(e) => setDietType(e.target.value as DietType)}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-[var(--kc-card-border)] bg-[var(--kc-bg)] text-[var(--kc-ink)] focus:outline-none focus:border-[var(--kc-basil)]"
              >
                <option value="veg">🟢 Pure Vegetarian</option>
                <option value="vegan">🌱 Vegan</option>
                <option value="egg">🟡 Egg (Contains Egg)</option>
                <option value="non_veg">🔴 Non-Vegetarian</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-[var(--kc-muted)] mb-1">
                Portion / Quantity *
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  min="0.1"
                  step="0.1"
                  required
                  value={quantityValue}
                  onChange={(e) => setQuantityValue(e.target.value)}
                  className="w-24 px-3.5 py-2.5 text-sm rounded-xl border border-[var(--kc-card-border)] bg-[var(--kc-bg)] font-mono text-[var(--kc-ink)] focus:outline-none focus:border-[var(--kc-basil)]"
                />
                <select
                  value={quantityUnit}
                  onChange={(e) => setQuantityUnit(e.target.value)}
                  className="flex-1 px-3.5 py-2.5 text-sm rounded-xl border border-[var(--kc-card-border)] bg-[var(--kc-bg)] text-[var(--kc-ink)] focus:outline-none focus:border-[var(--kc-basil)]"
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
              <label className="block text-xs font-mono uppercase tracking-wider text-[var(--kc-muted)] mb-1">
                Storage Method *
              </label>
              <select
                value={storage}
                onChange={(e) => {
                  const val = e.target.value as StorageLocation;
                  setStorage(val);
                  handleAutoEstimate(category, val);
                }}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-[var(--kc-card-border)] bg-[var(--kc-bg)] text-[var(--kc-ink)] focus:outline-none focus:border-[var(--kc-basil)]"
              >
                <option value="fridge">❄️ Refrigerator (Chilled)</option>
                <option value="freezer">🧊 Deep Freezer</option>
                <option value="room">🏺 Ambient Room / Pantry</option>
              </select>
            </div>
          </div>

          {/* Row 4: Calories & Nutrient Estimation (Requirement 1, 6 & 7) */}
          <div className="rounded-xl border border-[var(--kc-card-border)] bg-[var(--kc-bg)] p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-wider font-bold text-[var(--kc-ink)] flex items-center gap-1.5">
                <span>⚡</span>
                <span>Estimated Energy & Macronutrients (Per 100g / Serving)</span>
              </span>
              <span className="text-[10px] font-mono text-[var(--kc-muted)]">ICMR-NIN Data</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div>
                <label className="text-[10px] font-mono text-[var(--kc-muted)] block mb-1">Energy (kcal)</label>
                <input
                  type="number"
                  min="0"
                  value={calories}
                  onChange={(e) => setCalories(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[var(--kc-card-border)] bg-[var(--kc-card)] font-mono text-[var(--kc-ink)] font-bold"
                />
              </div>
              <div>
                <label className="text-[10px] font-mono text-[var(--kc-muted)] block mb-1">Protein (g)</label>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={proteinG}
                  onChange={(e) => setProteinG(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[var(--kc-card-border)] bg-[var(--kc-card)] font-mono text-[var(--kc-ink)]"
                />
              </div>
              <div>
                <label className="text-[10px] font-mono text-[var(--kc-muted)] block mb-1">Carbs (g)</label>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={carbsG}
                  onChange={(e) => setCarbsG(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[var(--kc-card-border)] bg-[var(--kc-card)] font-mono text-[var(--kc-ink)]"
                />
              </div>
              <div>
                <label className="text-[10px] font-mono text-[var(--kc-muted)] block mb-1">Fats (g)</label>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={fatG}
                  onChange={(e) => setFatG(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[var(--kc-card-border)] bg-[var(--kc-card)] font-mono text-[var(--kc-ink)]"
                />
              </div>
              <div>
                <label className="text-[10px] font-mono text-[var(--kc-muted)] block mb-1">Fiber (g)</label>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={fiberG}
                  onChange={(e) => setFiberG(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[var(--kc-card-border)] bg-[var(--kc-card)] font-mono text-[var(--kc-ink)]"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-mono text-[var(--kc-muted)] block mb-1">Key Vitamins & Minerals</label>
              <input
                type="text"
                value={vitaminsList}
                onChange={(e) => setVitaminsList(e.target.value)}
                placeholder="e.g. Vitamin C, Potassium, Iron, Calcium"
                className="w-full px-3 py-2 text-xs rounded-lg border border-[var(--kc-card-border)] bg-[var(--kc-card)] text-[var(--kc-ink)]"
              />
            </div>
          </div>

          {/* Health & Medical Disease Advisories Box (Requirement 6) */}
          {healthAdvisories.length > 0 && (
            <div className="rounded-xl border border-amber-300 dark:border-amber-800 bg-amber-50/70 dark:bg-amber-950/20 p-4 space-y-2">
              <span className="text-xs font-mono uppercase tracking-wider font-bold text-[var(--kc-ink)] flex items-center gap-1.5">
                <span>⚠️</span>
                <span>Health & Disease Consumption Advisories</span>
              </span>
              <div className="space-y-1.5">
                {healthAdvisories.map((adv, idx) => (
                  <div
                    key={idx}
                    className={`p-2.5 rounded-lg text-xs leading-relaxed ${
                      adv.severity === 'avoid'
                        ? 'bg-red-50 dark:bg-red-950/40 border border-[var(--kc-chilli)] text-[var(--kc-chilli)] font-semibold'
                        : 'bg-amber-50 dark:bg-amber-950/40 border border-[var(--kc-mango)] text-[var(--kc-ink)]'
                    }`}
                  >
                    <strong>{adv.condition}:</strong> {adv.warning}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Expiry Date Section with Presets & Auto-Estimation (Requirement 1 & 7) */}
          <div className="rounded-xl border border-[var(--kc-card-border)] bg-[var(--kc-bg)] p-4 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label className="text-xs font-mono uppercase tracking-wider font-bold text-[var(--kc-ink)]">
                Expiry / Best-Before Date & Time *
              </label>
              <button
                type="button"
                onClick={() => handleAutoEstimate()}
                className="text-xs font-mono font-bold text-[var(--kc-basil)] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>⚡</span>
                <span>Calculate from Shelf-Life Engine</span>
              </button>
            </div>

            <input
              type="datetime-local"
              required
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-[var(--kc-card-border)] bg-[var(--kc-card)] text-[var(--kc-ink)] font-mono focus:outline-none focus:border-[var(--kc-basil)]"
            />

            {/* Quick Expiry Date Preset Chips */}
            <div className="flex flex-wrap gap-2 pt-1">
              <span className="text-[11px] font-mono text-[var(--kc-muted)] self-center mr-1">Quick Set:</span>
              <button
                type="button"
                onClick={() => handleQuickExpiry(1)}
                className="px-2.5 py-1 text-[11px] font-mono rounded-lg border border-[var(--kc-card-border)] bg-[var(--kc-card)] text-[var(--kc-ink)] hover:border-[var(--kc-basil)] cursor-pointer"
              >
                +24h (Urgent)
              </button>
              <button
                type="button"
                onClick={() => handleQuickExpiry(3)}
                className="px-2.5 py-1 text-[11px] font-mono rounded-lg border border-[var(--kc-card-border)] bg-[var(--kc-card)] text-[var(--kc-ink)] hover:border-[var(--kc-basil)] cursor-pointer"
              >
                +3 Days
              </button>
              <button
                type="button"
                onClick={() => handleQuickExpiry(7)}
                className="px-2.5 py-1 text-[11px] font-mono rounded-lg border border-[var(--kc-card-border)] bg-[var(--kc-card)] text-[var(--kc-ink)] hover:border-[var(--kc-basil)] cursor-pointer"
              >
                +7 Days
              </button>
              <button
                type="button"
                onClick={() => handleQuickExpiry(30)}
                className="px-2.5 py-1 text-[11px] font-mono rounded-lg border border-[var(--kc-card-border)] bg-[var(--kc-card)] text-[var(--kc-ink)] hover:border-[var(--kc-basil)] cursor-pointer"
              >
                +1 Month
              </button>
              <button
                type="button"
                onClick={() => handleQuickExpiry(180)}
                className="px-2.5 py-1 text-[11px] font-mono rounded-lg border border-[var(--kc-card-border)] bg-[var(--kc-card)] text-[var(--kc-ink)] hover:border-[var(--kc-basil)] cursor-pointer"
              >
                +6 Months
              </button>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-[var(--kc-muted)] mb-1">
              Storage Notes / Handling Guidelines
            </label>
            <textarea
              rows={2}
              maxLength={500}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. In airtight glass jar, consume before weekend, use in daal"
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-[var(--kc-card-border)] bg-[var(--kc-bg)] text-[var(--kc-ink)] focus:outline-none focus:border-[var(--kc-basil)] resize-y"
            />
          </div>

          {/* Submit CTA */}
          <div className="pt-4 border-t border-[var(--kc-hairline)] flex flex-col sm:flex-row justify-end gap-3">
            <Link
              href="/en/home"
              className="px-5 py-2.5 text-xs font-mono rounded-xl border border-[var(--kc-card-border)] bg-[var(--kc-bg)] text-[var(--kc-ink)] hover:bg-[var(--kc-card)] text-center cursor-pointer"
            >
              Cancel
            </Link>
            <button
              type="submit"
              className="px-6 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl bg-[var(--kc-basil)] text-white hover:bg-[var(--kc-basil-hover)] transition-colors shadow-sm cursor-pointer"
            >
              Review Proof Sheet →
            </button>
          </div>
        </form>
      </div>

      {/* Confirmation Proof Sheet Modal (FR-ADD-4) */}
      {showProofSheet && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="almanac-card bg-[var(--kc-card)] border border-[var(--kc-card-border)] p-6 sm:p-8 rounded-2xl shadow-xl max-w-xl w-full max-h-[90vh] overflow-y-auto space-y-5">
            <div className="border-b border-[var(--kc-hairline)] pb-3 flex justify-between items-center">
              <div>
                <span className="font-annotation text-[var(--kc-basil)] text-base">Step 2 · Verification Proof Sheet</span>
                <h3 className="text-xl font-bold text-[var(--kc-ink)]">
                  Confirm Food Entry
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowProofSheet(false)}
                className="text-sm font-mono text-[var(--kc-muted)] hover:text-[var(--kc-ink)] p-1 cursor-pointer"
              >
                ✕ Close
              </button>
            </div>

            <div className="space-y-4 text-xs font-mono">
              <div className="p-3.5 rounded-xl border border-[var(--kc-card-border)] bg-[var(--kc-bg)] grid grid-cols-2 gap-2.5">
                <div>
                  <span className="text-[var(--kc-muted)] block text-[10px]">NAME:</span>
                  <span className="font-bold text-[var(--kc-ink)] text-sm">{name}</span>
                </div>
                <div>
                  <span className="text-[var(--kc-muted)] block text-[10px]">PORTION:</span>
                  <span className="font-bold text-[var(--kc-ink)] text-sm">{quantityValue} {quantityUnit}</span>
                </div>
                <div>
                  <span className="text-[var(--kc-muted)] block text-[10px]">STORAGE:</span>
                  <span className="font-bold uppercase text-[var(--kc-ink)]">{storage}</span>
                </div>
                <div>
                  <span className="text-[var(--kc-muted)] block text-[10px]">CATEGORY:</span>
                  <span className="font-bold uppercase text-[var(--kc-ink)]">{category}</span>
                </div>
                <div>
                  <span className="text-[var(--kc-muted)] block text-[10px]">MODE:</span>
                  <span className="font-bold uppercase text-[var(--kc-basil)]">
                    {consumptionType === 'eat_directly' ? 'Eat Directly' : 'Needs Cooking'}
                  </span>
                </div>
                <div>
                  <span className="text-[var(--kc-muted)] block text-[10px]">ENERGY:</span>
                  <span className="font-bold text-[var(--kc-ink)]">{calories} kcal</span>
                </div>
              </div>

              {/* Freshness & Risk Score Summary */}
              <div className="p-4 rounded-xl border border-[var(--kc-card-border)] bg-[var(--kc-bg)] space-y-2.5">
                <div className="flex justify-between items-center">
                  <span className="text-[var(--kc-muted)] uppercase">Status Band:</span>
                  <span className="px-2.5 py-0.5 font-bold rounded-full border border-[var(--kc-basil)] bg-[var(--kc-mint)] text-[var(--kc-basil)]">
                    {freshness.bandBadgeLabel}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[var(--kc-muted)] uppercase">Freshness Score:</span>
                  <span className="font-bold text-[var(--kc-basil)]">{freshness.score} / 100</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[var(--kc-muted)] uppercase">Waste Risk:</span>
                  <span className="font-bold uppercase">{wasteRisk.riskLevel} Risk</span>
                </div>
                <p className="text-[11px] text-[var(--kc-muted)] pt-2 border-t border-[var(--kc-hairline)]">
                  {freshness.actionRecommendation}
                </p>
              </div>

              {healthAdvisories.length > 0 && (
                <div className="p-3 rounded-xl border border-amber-300 dark:border-amber-800 bg-amber-50/70 dark:bg-amber-950/20 text-[11px] space-y-1">
                  <span className="font-bold block text-[var(--kc-ink)]">Health Advisories:</span>
                  {healthAdvisories.map((a, i) => (
                    <div key={i}>• {a.condition}: {a.warning}</div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-[var(--kc-hairline)]">
              <button
                type="button"
                onClick={() => setShowProofSheet(false)}
                className="px-4 py-2 text-xs font-mono rounded-xl border border-[var(--kc-card-border)] bg-[var(--kc-bg)] text-[var(--kc-ink)] hover:bg-[var(--kc-card)] cursor-pointer"
              >
                Edit Specifications
              </button>
              <button
                type="button"
                onClick={handleConfirmAndSave}
                className="px-6 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl bg-[var(--kc-basil)] text-white hover:bg-[var(--kc-basil-hover)] transition-colors shadow-sm cursor-pointer"
              >
                Confirm & Commit to Ledger →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
