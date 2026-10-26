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

  // Smart Image & Vision Intake State (PyTorch MobileNetV2 + Perceptual Engine)
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isAnalyzingPhoto, setIsAnalyzingPhoto] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [visionFeedback, setVisionFeedback] = useState<{
    engine: string;
    confidence: number;
    predictions?: Array<{ label: string; confidence: number }>;
    determined?: {
      name: string;
      category: FoodCategory;
      storage: StorageLocation;
      shelfLifeDays?: number;
      expiryDate: string;
      calories: number;
      protein: number;
      carbs: number;
      fat: number;
      fiber: number;
      consumptionType: 'eat_directly' | 'needs_cooking';
      dietType: DietType;
    };
  } | null>(null);
  const videoRef = React.useRef<HTMLVideoElement | null>(null);
  const photoInputRef = React.useRef<HTMLInputElement | null>(null);
  const mobileCameraInputRef = React.useRef<HTMLInputElement | null>(null);

  // Receipt OCR State
  const [receiptImage, setReceiptImage] = useState<string | null>(null);
  const [receiptTextInput, setReceiptTextInput] = useState<string>('');
  const [receiptIsDragging, setReceiptIsDragging] = useState(false);
  const [parsedReceiptItems, setParsedReceiptItems] = useState<Array<{
    name: string;
    quantity: string;
    unit: string;
    category: FoodCategory;
    suggestedStorage: StorageLocation;
    expiryDate: string;
    calories: number;
    confidence: number;
  }>>([]);
  const receiptInputRef = React.useRef<HTMLInputElement | null>(null);
  const receiptMobileInputRef = React.useRef<HTMLInputElement | null>(null);

  // Clean up camera stream on unmount
  React.useEffect(() => {
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // Listen for clipboard paste (Ctrl+V) anywhere on the page for images
  React.useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const activeEl = document.activeElement;
      if (activeEl?.tagName === 'INPUT' || activeEl?.tagName === 'TEXTAREA') return;

      const items = e.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith('image/')) {
          const file = items[i].getAsFile();
          if (file) {
            e.preventDefault();
            setMode('camera');
            processImageFile(file);
            break;
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, []);

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

  // Barcode lookup handler (Open Food Facts + Domestic Food KB)
  const handleBarcodeLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcodeQuery.trim()) return;

    setBarcodeSearching(true);
    setBarcodeFeedback(null);

    try {
      const res = await fetch('/api/inventory/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'barcode', barcode: barcodeQuery.trim() }),
      });
      const data = await res.json();
      setBarcodeSearching(false);

      if (data.success && data.name) {
        setName(data.name);
        if (data.category) setCategory(data.category);
        if (data.consumptionType) setConsumptionType(data.consumptionType);
        if (data.nutrition?.calories) setCalories(data.nutrition.calories);
        if (data.nutrition?.protein !== undefined) setProteinG(data.nutrition.protein);
        if (data.nutrition?.carbs !== undefined) setCarbsG(data.nutrition.carbs);
        if (data.nutrition?.fat !== undefined) setFatG(data.nutrition.fat);
        if (data.nutrition?.fiber !== undefined) setFiberG(data.nutrition.fiber);
        if (data.nutrition?.vitamins && data.nutrition.vitamins.length > 0) {
          setVitaminsList(data.nutrition.vitamins.join(', '));
        }
        if (data.suggestedStorage) setStorage(data.suggestedStorage);
        if (data.healthAdvisories) setHealthAdvisories(data.healthAdvisories);
        if (data.brand) setNotes(`Brand: ${data.brand}`);

        handleAutoEstimate(data.category || category, data.suggestedStorage || storage);
        setBarcodeFeedback(`✓ Found "${data.name}" in domestic registry with full nutritional profile.`);
        setMode('manual');
      } else {
        // Fallback to direct client lookup
        const directResult = await lookupBarcode(barcodeQuery);
        if (directResult.found && directResult.name) {
          setName(directResult.name);
          if (directResult.category) setCategory(directResult.category);
          if (directResult.caloriesKcal) setCalories(directResult.caloriesKcal);
          handleAutoEstimate(directResult.category || category, storage);
          setBarcodeFeedback(`✓ Found "${directResult.name}".`);
          setMode('manual');
        } else {
          setBarcodeFeedback('Product barcode not found in open registry. Please enter details manually.');
        }
      }
    } catch {
      setBarcodeSearching(false);
      setBarcodeFeedback('Error querying barcode database.');
    }
  };

  // Start Live Camera
  const startCamera = async () => {
    setCameraError(null);
    try {
      if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
        setCameraError('Camera API is unavailable on this device/browser. Please upload an image.');
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraActive(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '';
      setCameraError(`Camera permission blocked (${msg || 'Denied'}). Please upload a photo instead.`);
      setCameraActive(false);
    }
  };

  // Stop Live Camera
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  // Snap photo from live camera canvas
  const handleCaptureFromCamera = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      stopCamera();
      analyzePhotoWithPyTorch(dataUrl);
    }
  };

  // Unified image file processor (for Drag & Drop, File Picker, Camera, and Paste)
  const processImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please upload, drop, or paste a valid image file (JPEG, PNG, WebP).');
      return;
    }
    setErrorMsg(null);
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      analyzePhotoWithPyTorch(base64);
    };
    reader.readAsDataURL(file);
  };

  // Handle uploaded photo from file input
  const handlePhotoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processImageFile(file);
    e.target.value = '';
  };

  // Drag and drop handlers for Smart Image Scan
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  // Run PyTorch & Domestic Food Vision analysis via /api/inventory/scan
  // Automatically determines food name, category, storage, expiry, freshness, and complete macros
  const analyzePhotoWithPyTorch = async (base64Image: string) => {
    setCapturedImage(base64Image);
    setIsAnalyzingPhoto(true);
    setErrorMsg(null);
    setVisionFeedback(null);

    try {
      const res = await fetch('/api/inventory/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64Image, mode: 'produce' }),
      });
      const data = await res.json();

      if (data.success) {
        const determinedName = data.name || 'Fresh Market Produce';
        const effectiveCategory: FoodCategory = data.category || 'vegetables';
        const effectiveStorage: StorageLocation = data.suggestedStorage || 'fridge';
        const effectiveDiet: DietType = data.dietType || 'veg';
        const effectiveConsumption: 'eat_directly' | 'needs_cooking' = data.consumptionType || 'needs_cooking';

        setName(determinedName);
        setCategory(effectiveCategory);
        setDietType(effectiveDiet);
        setStorage(effectiveStorage);
        setConsumptionType(effectiveConsumption);
        if (data.quantityValue) setQuantityValue(data.quantityValue);
        if (data.quantityUnit) setQuantityUnit(data.quantityUnit);
        if (data.calories !== undefined) setCalories(data.calories);
        if (data.protein !== undefined) setProteinG(data.protein);
        if (data.carbs !== undefined) setCarbsG(data.carbs);
        if (data.fat !== undefined) setFatG(data.fat);
        if (data.fiber !== undefined) setFiberG(data.fiber);
        if (data.vitamins && data.vitamins.length > 0) {
          setVitaminsList(Array.isArray(data.vitamins) ? data.vitamins.join(', ') : data.vitamins);
        }
        if (data.healthAdvisories) setHealthAdvisories(data.healthAdvisories);

        let finalExpiry = data.expiryDate;
        if (!finalExpiry) {
          const { expiryDate: estimated } = estimateExpiryDate(effectiveCategory, effectiveStorage);
          finalExpiry = estimated.toISOString().substring(0, 16);
        }
        setExpiryDate(finalExpiry);

        setNotes(`AI Vision: ${determinedName} · ${data.engine || 'Visual Classifier'} (${Math.round((data.confidence || 0.9) * 100)}% match)`);

        setVisionFeedback({
          engine: data.engine === 'pytorch_mobilenet_v2' ? 'PyTorch MobileNetV2 Vision' : 'Domestic Kitchen Vision Classifier',
          confidence: Math.round((data.confidence || 0.88) * 100),
          predictions: data.topPredictions || [],
          determined: {
            name: determinedName,
            category: effectiveCategory,
            storage: effectiveStorage,
            shelfLifeDays: data.shelfLifeDays,
            expiryDate: finalExpiry,
            calories: data.calories !== undefined ? data.calories : calories,
            protein: data.protein !== undefined ? data.protein : proteinG,
            carbs: data.carbs !== undefined ? data.carbs : carbsG,
            fat: data.fat !== undefined ? data.fat : fatG,
            fiber: data.fiber !== undefined ? data.fiber : fiberG,
            consumptionType: effectiveConsumption,
            dietType: effectiveDiet,
          },
        });
      } else {
        setErrorMsg(data.error || 'Failed to classify produce');
      }
    } catch {
      setErrorMsg('Could not reach vision engine service. You can enter details manually.');
    } finally {
      setIsAnalyzingPhoto(false);
    }
  };

  // Unified receipt file processor (for Drag & Drop, File Picker, Mobile Camera, and Paste)
  const processReceiptFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please select or drop an image file of your receipt.');
      return;
    }
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      setReceiptImage(base64);
      await runReceiptOCR({ image: base64 });
    };
    reader.readAsDataURL(file);
  };

  // Receipt image file upload
  const handleReceiptImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processReceiptFile(file);
    e.target.value = '';
  };

  // Run Receipt OCR
  const runReceiptOCR = async (payload: { image?: string; text?: string }) => {
    setOcrScanning(true);
    setOcrFeedback(null);
    setParsedReceiptItems([]);

    try {
      const res = await fetch('/api/inventory/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'receipt', ...payload }),
      });
      const data = await res.json();

      if (data.success && data.detectedItems && data.detectedItems.length > 0) {
        setParsedReceiptItems(data.detectedItems);
        setOcrFeedback(`✓ OCR Parsed: ${data.detectedItems.length} grocery items identified from receipt.`);
        // Auto-fill the first recognized item
        const topItem = data.detectedItems[0];
        applyReceiptItem(topItem);
      } else {
        setOcrFeedback('No food items detected in text. You can select a sample or enter manually.');
      }
    } catch {
      setOcrFeedback('Receipt scan failed. Please check network or enter manually.');
    } finally {
      setOcrScanning(false);
    }
  };

  // Apply a parsed receipt item to the form
  const applyReceiptItem = (item: {
    name: string;
    quantity: string;
    unit: string;
    category: FoodCategory;
    suggestedStorage: StorageLocation;
    expiryDate: string;
    calories: number;
  }) => {
    setName(item.name);
    setQuantityValue(item.quantity || '1');
    setQuantityUnit(item.unit || 'kg');
    if (item.category) setCategory(item.category);
    if (item.suggestedStorage) setStorage(item.suggestedStorage);
    if (item.expiryDate) setExpiryDate(item.expiryDate);
    if (item.calories) setCalories(item.calories);
    handleAutoEstimate(item.category, item.suggestedStorage);
  };

  // Grocery Receipt & Expiry Label OCR Parser (Preset quick demos)
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
    }, 300);
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
          <KhabarIcon name="scan" size={14} />
          <span>Smart Image Scan</span>
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
        <div className="almanac-card bg-[var(--kc-card)] border border-[var(--kc-card-border)] p-6 mb-8 rounded-2xl shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-[var(--kc-hairline)] pb-3">
            <div className="flex items-center gap-2">
              <span className="text-xl">🧾</span>
              <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--kc-ink)]">
                Grocery Receipt & Expiry Label OCR Scanner
              </h2>
            </div>
            <span className="text-xs font-mono font-bold text-[var(--kc-basil)] bg-[var(--kc-mint)] px-2.5 py-0.5 rounded-full">
              Vision & Text Parser
            </span>
          </div>

          <p className="text-xs text-[var(--kc-muted)] leading-relaxed">
            Upload a photo of your supermarket/bazaar bill, paste text from a digital receipt or grocery delivery SMS (Blinkit, Zepto, BigBasket), or pick a preset sample:
          </p>

          {/* Option A: Upload Bill Photo / Drag & Drop */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div
              onDragOver={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setReceiptIsDragging(true);
            }}
            onDragEnter={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setReceiptIsDragging(true);
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setReceiptIsDragging(false);
            }}
            onDrop={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setReceiptIsDragging(false);
              const file = e.dataTransfer.files?.[0];
              if (file) {
                processReceiptFile(file);
              }
            }}
            className={`p-3.5 rounded-xl border border-dashed transition-all flex flex-col justify-between gap-3 ${
              receiptIsDragging
                ? 'border-[var(--kc-basil)] bg-[var(--kc-mint)]/40 scale-[1.01]'
                : 'border-[var(--kc-card-border)] bg-[var(--kc-bg)] hover:border-[var(--kc-basil)]'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[var(--kc-mint)] flex items-center justify-center text-lg shrink-0">
                🧾
              </div>
              <div>
                <span className="text-xs font-bold text-[var(--kc-ink)] block">
                  {receiptIsDragging ? 'Drop Bill Image to Scan!' : 'Upload / Drop Receipt'}
                </span>
                <span className="text-[11px] text-[var(--kc-muted)]">
                  Scan supermarket bill or delivery slip
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => receiptMobileInputRef.current?.click()}
                className="px-2.5 py-1.5 rounded-lg border border-[var(--kc-card-border)] bg-[var(--kc-card)] hover:border-[var(--kc-basil)] transition-all text-[11px] font-bold text-[var(--kc-ink)] flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>📷</span>
                <span>Snap Bill</span>
              </button>
              <input
                type="file"
                ref={receiptMobileInputRef}
                accept="image/*"
                capture="environment"
                onChange={handleReceiptImageUpload}
                className="hidden"
              />

              <button
                type="button"
                onClick={() => receiptInputRef.current?.click()}
                className="px-2.5 py-1.5 rounded-lg border border-[var(--kc-card-border)] bg-[var(--kc-card)] hover:border-[var(--kc-basil)] transition-all text-[11px] font-bold text-[var(--kc-ink)] flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>📁</span>
                <span>Browse Bill</span>
              </button>
              <input
                type="file"
                ref={receiptInputRef}
                accept="image/*"
                onChange={handleReceiptImageUpload}
                className="hidden"
              />
            </div>
          </div>

            {/* Option B: Digital Receipt Paste */}
            <div className="p-3.5 rounded-xl border border-[var(--kc-card-border)] bg-[var(--kc-bg)] flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[var(--kc-ink)]">Paste Digital / SMS Bill</span>
                <button
                  type="button"
                  onClick={() => runReceiptOCR({ text: receiptTextInput })}
                  disabled={ocrScanning || !receiptTextInput.trim()}
                  className="text-[11px] font-mono font-bold text-[var(--kc-basil)] hover:underline disabled:opacity-40 cursor-pointer"
                >
                  Extract Items →
                </button>
              </div>
              <textarea
                value={receiptTextInput}
                onChange={(e) => setReceiptTextInput(e.target.value)}
                placeholder="e.g. Blinkit: 1L Toned Milk, 2kg Potato, 1kg Atta, 500g Paneer..."
                rows={2}
                className="w-full text-xs p-2 rounded-lg border border-[var(--kc-card-border)] bg-[var(--kc-card)] text-[var(--kc-ink)] font-mono resize-none focus:outline-none focus:border-[var(--kc-basil)]"
              />
            </div>
          </div>

          {/* Preset Demos for quick test */}
          <div>
            <span className="text-[11px] font-mono uppercase tracking-wider text-[var(--kc-muted)] block mb-2">
              Or Try One-Click Preset Receipts:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => handleReceiptOCR('dairy')}
                disabled={ocrScanning}
                className="p-3 text-left rounded-xl border border-[var(--kc-card-border)] bg-[var(--kc-bg)] hover:border-[var(--kc-basil)] transition-all cursor-pointer"
              >
                <div className="text-base mb-0.5">🥛</div>
                <span className="text-xs font-bold text-[var(--kc-ink)] block">Amul Milk Invoice</span>
                <span className="text-[11px] text-[var(--kc-muted)]">48h use-by & batch</span>
              </button>

              <button
                type="button"
                onClick={() => handleReceiptOCR('vegetable')}
                disabled={ocrScanning}
                className="p-3 text-left rounded-xl border border-[var(--kc-card-border)] bg-[var(--kc-bg)] hover:border-[var(--kc-basil)] transition-all cursor-pointer"
              >
                <div className="text-base mb-0.5">🥬</div>
                <span className="text-xs font-bold text-[var(--kc-ink)] block">Bazaar Sabzi Mandi</span>
                <span className="text-[11px] text-[var(--kc-muted)]">Fresh harvest produce</span>
              </button>

              <button
                type="button"
                onClick={() => handleReceiptOCR('packaged')}
                disabled={ocrScanning}
                className="p-3 text-left rounded-xl border border-[var(--kc-card-border)] bg-[var(--kc-bg)] hover:border-[var(--kc-basil)] transition-all cursor-pointer"
              >
                <div className="text-base mb-0.5">🌾</div>
                <span className="text-xs font-bold text-[var(--kc-ink)] block">Chakki Atta / Grain</span>
                <span className="text-[11px] text-[var(--kc-muted)]">6-month pantry staple</span>
              </button>
            </div>
          </div>

          {ocrScanning && (
            <div className="p-3 bg-[var(--kc-mint)] text-[var(--kc-basil)] text-xs font-mono flex items-center gap-2 rounded-xl">
              <span className="w-3.5 h-3.5 border-2 border-[var(--kc-basil)] border-t-transparent rounded-full animate-spin" />
              Running OCR character recognition and receipt parsing algorithms...
            </div>
          )}

          {ocrFeedback && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-mono rounded-xl font-bold">
              {ocrFeedback}
            </div>
          )}

          {/* Parsed Receipt Items List */}
          {parsedReceiptItems.length > 0 && (
            <div className="border border-[var(--kc-card-border)] bg-[var(--kc-bg)] p-4 rounded-xl space-y-2">
              <span className="text-xs font-bold text-[var(--kc-ink)] block">
                Extracted Grocery Items ({parsedReceiptItems.length}):
              </span>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {parsedReceiptItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2.5 rounded-lg border border-[var(--kc-card-border)] bg-[var(--kc-card)] text-xs"
                  >
                    <div>
                      <span className="font-bold text-[var(--kc-ink)] block">{item.name}</span>
                      <span className="text-[11px] font-mono text-[var(--kc-muted)]">
                        {item.quantity} {item.unit} · {item.category} · {item.suggestedStorage}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        applyReceiptItem(item);
                        setMode('manual');
                      }}
                      className="px-3 py-1 text-xs font-mono font-bold rounded-lg bg-[var(--kc-mint)] text-[var(--kc-basil)] border border-[var(--kc-basil)] hover:bg-[var(--kc-basil)] hover:text-white transition-colors cursor-pointer"
                    >
                      Fill Form
                    </button>
                  </div>
                ))}
              </div>
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

      {/* Mode Panel: Smart Image Scan (Drag & Drop + Mobile Camera + Vision AI) */}
      {mode === 'camera' && (
        <div className="almanac-card bg-[var(--kc-card)] border border-[var(--kc-card-border)] p-6 mb-8 rounded-2xl shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-[var(--kc-hairline)] pb-3">
            <div className="flex items-center gap-2">
              <KhabarIcon name="scan" className="w-5 h-5 text-[var(--kc-basil)]" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--kc-ink)]">
                Smart Image & Food Vision AI Scanner
              </h2>
            </div>
            <span className="text-[11px] font-mono font-bold text-[var(--kc-basil)] bg-[var(--kc-mint)] px-2.5 py-0.5 rounded-full">
              Vision AI · Mobile & Drop
            </span>
          </div>

          <p className="text-xs text-[var(--kc-muted)] leading-relaxed">
            Drag &amp; drop any food image, snap with your mobile camera, browse files, or paste from clipboard (Ctrl+V). Our intelligence engine classifies the food item, estimates shelf-life, assigns optimal storage zone, and populates complete nutritional macros automatically.
          </p>

          {/* Interactive Drag & Drop Zone */}
          {!cameraActive && !capturedImage && (
            <div
              onDragOver={handleDragOver}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`rounded-2xl border-2 border-dashed p-6 transition-all text-center flex flex-col items-center justify-center gap-4 ${
                isDragging
                  ? 'border-[var(--kc-basil)] bg-[var(--kc-mint)]/50 scale-[1.01] shadow-lg'
                  : 'border-[var(--kc-card-border)] bg-[var(--kc-bg)] hover:border-[var(--kc-basil)]'
              }`}
            >
              <div className="w-14 h-14 rounded-2xl bg-[var(--kc-mint)] flex items-center justify-center text-2xl shadow-xs transition-transform group-hover:scale-105">
                📸
              </div>

              <div className="max-w-md space-y-1">
                <span className="text-sm font-bold text-[var(--kc-ink)] block">
                  {isDragging ? 'Drop Image Here to Determine Everything!' : 'Drag & Drop Any Food Image Here'}
                </span>
                <span className="text-xs text-[var(--kc-muted)] block">
                  JPEG, PNG, WebP or HEIC · Or paste copied screenshot (Ctrl+V)
                </span>
              </div>

              {/* Action Buttons: Mobile Camera Snap & File Browsing */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 w-full max-w-lg pt-2">
                {/* 1. Mobile Camera Snap */}
                <button
                  type="button"
                  onClick={() => mobileCameraInputRef.current?.click()}
                  className="px-3.5 py-2.5 rounded-xl border border-[var(--kc-card-border)] bg-[var(--kc-card)] hover:border-[var(--kc-basil)] hover:bg-[var(--kc-mint)]/20 transition-all flex items-center justify-center gap-2 cursor-pointer text-xs font-bold text-[var(--kc-ink)]"
                  title="Direct camera snap for mobile devices"
                >
                  <span className="text-base">📷</span>
                  <span>Snap Photo</span>
                </button>
                <input
                  type="file"
                  ref={mobileCameraInputRef}
                  accept="image/*"
                  capture="environment"
                  onChange={handlePhotoFileUpload}
                  className="hidden"
                />

                {/* 2. Photo Library / Gallery Browse */}
                <button
                  type="button"
                  onClick={() => photoInputRef.current?.click()}
                  className="px-3.5 py-2.5 rounded-xl border border-[var(--kc-card-border)] bg-[var(--kc-card)] hover:border-[var(--kc-basil)] hover:bg-[var(--kc-mint)]/20 transition-all flex items-center justify-center gap-2 cursor-pointer text-xs font-bold text-[var(--kc-ink)]"
                >
                  <span className="text-base">📁</span>
                  <span>Browse Files</span>
                </button>
                <input
                  type="file"
                  ref={photoInputRef}
                  accept="image/*"
                  onChange={handlePhotoFileUpload}
                  className="hidden"
                />

                {/* 3. Live Webcam Viewfinder */}
                <button
                  type="button"
                  onClick={startCamera}
                  className="px-3.5 py-2.5 rounded-xl border border-[var(--kc-card-border)] bg-[var(--kc-card)] hover:border-[var(--kc-basil)] hover:bg-[var(--kc-mint)]/20 transition-all flex items-center justify-center gap-2 cursor-pointer text-xs font-bold text-[var(--kc-ink)]"
                >
                  <span className="text-base">🎥</span>
                  <span>Live Webcam</span>
                </button>
              </div>
            </div>
          )}

          {/* Live Video Camera Viewfinder */}
          {cameraActive && (
            <div className="space-y-4">
              <div className="relative rounded-2xl overflow-hidden border-2 border-[var(--kc-basil)] bg-black max-w-md mx-auto aspect-video flex items-center justify-center shadow-lg">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-4 border border-white/40 border-dashed rounded-xl pointer-events-none flex items-center justify-center">
                  <div className="w-12 h-12 border-2 border-white/60 rounded-full" />
                </div>
                <div className="absolute bottom-2 left-2 right-2 text-center pointer-events-none">
                  <span className="text-[10px] font-mono text-white/80 bg-black/60 px-2 py-0.5 rounded-md backdrop-blur-xs">
                    Center food produce in crosshair frame
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={handleCaptureFromCamera}
                  className="px-6 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl bg-[var(--kc-basil)] text-white hover:bg-[var(--kc-basil-hover)] shadow-md flex items-center gap-2 cursor-pointer"
                >
                  <span>📸</span>
                  <span>Capture &amp; Determine Everything</span>
                </button>
                <button
                  type="button"
                  onClick={stopCamera}
                  className="px-4 py-2.5 text-xs font-mono font-semibold rounded-xl border border-[var(--kc-card-border)] bg-[var(--kc-card)] text-[var(--kc-muted)] hover:text-[var(--kc-ink)] cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Analyzing Progress State */}
          {isAnalyzingPhoto && (
            <div className="p-4 rounded-xl border border-[var(--kc-basil)] bg-[var(--kc-mint)]/40 flex items-center gap-3 animate-pulse">
              <span className="w-5 h-5 border-2 border-[var(--kc-basil)] border-t-transparent rounded-full animate-spin shrink-0" />
              <div className="text-xs space-y-0.5">
                <span className="font-bold text-[var(--kc-ink)] block">
                  Determining Food Intelligence with AI Vision...
                </span>
                <span className="text-[11px] font-mono text-[var(--kc-muted)]">
                  Classifying food produce, calculating shelf life, storage zone &amp; nutritional macros...
                </span>
              </div>
            </div>
          )}

          {/* Captured Image Preview & Determined Results */}
          {capturedImage && !isAnalyzingPhoto && (
            <div className="border border-[var(--kc-card-border)] bg-[var(--kc-bg)] p-5 rounded-2xl space-y-5">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
                <div className="relative w-28 h-28 rounded-xl overflow-hidden border-2 border-[var(--kc-basil)] shrink-0 shadow-md">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={capturedImage}
                    alt="Captured food item"
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex-1 text-center sm:text-left space-y-2">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <span className="text-base font-bold text-[var(--kc-ink)]">
                      {name || 'Detected Produce'}
                    </span>
                    {visionFeedback && (
                      <span className="text-[10px] font-mono font-bold text-[var(--kc-basil)] bg-[var(--kc-mint)] px-2.5 py-0.5 rounded-full border border-[var(--kc-basil)]/30">
                        {visionFeedback.confidence}% Confidence
                      </span>
                    )}
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[var(--kc-card)] border border-[var(--kc-card-border)] text-[var(--kc-muted)] uppercase">
                      {category}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[var(--kc-card)] border border-[var(--kc-card-border)] text-[var(--kc-muted)] uppercase">
                      {dietType}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[var(--kc-card)] border border-[var(--kc-card-border)] text-[var(--kc-muted)]">
                      {consumptionType === 'eat_directly' ? '🟢 Ready to Eat' : '🍳 Needs Cooking'}
                    </span>
                  </div>

                  <p className="text-xs text-[var(--kc-muted)]">
                    {visionFeedback
                      ? `Engine: ${visionFeedback.engine} · Location scrubbed for privacy.`
                      : 'Vision classification complete.'}
                  </p>

                  {visionFeedback?.predictions && visionFeedback.predictions.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                      <span className="text-[10px] font-mono text-[var(--kc-muted)]">Matches:</span>
                      {visionFeedback.predictions.map((p, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[var(--kc-card)] border border-[var(--kc-card-border)] text-[var(--kc-muted)]"
                        >
                          {p.label} ({(p.confidence * 100).toFixed(0)}%)
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Comprehensive Determined Intelligence Breakdown Card */}
              <div className="rounded-xl border border-[var(--kc-card-border)] bg-[var(--kc-card)] p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-[var(--kc-hairline)] pb-2">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--kc-basil)]">
                    ⚡ Determined Food Intelligence
                  </span>
                  <span className="text-[11px] font-mono text-[var(--kc-muted)]">
                    Auto-Mapped to Form
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                  <div className="p-2.5 rounded-lg border border-[var(--kc-card-border)] bg-[var(--kc-bg)]">
                    <span className="text-[10px] font-mono text-[var(--kc-muted)] block uppercase">Recommended Zone</span>
                    <span className="font-bold text-[var(--kc-ink)] capitalize flex items-center gap-1 mt-0.5">
                      <KhabarIcon name={storage === 'fridge' ? 'fridge' : storage === 'freezer' ? 'freezer' : 'pantry'} size={13} />
                      <span>{storage}</span>
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg border border-[var(--kc-card-border)] bg-[var(--kc-bg)]">
                    <span className="text-[10px] font-mono text-[var(--kc-muted)] block uppercase">Estimated Expiry</span>
                    <span className="font-bold text-[var(--kc-ink)] font-mono text-[11px] block mt-0.5">
                      {expiryDate ? expiryDate.replace('T', ' ') : 'Auto-estimated'}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg border border-[var(--kc-card-border)] bg-[var(--kc-bg)]">
                    <span className="text-[10px] font-mono text-[var(--kc-muted)] block uppercase">Default Quantity</span>
                    <span className="font-bold text-[var(--kc-ink)] block mt-0.5">
                      {quantityValue} {quantityUnit}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg border border-[var(--kc-card-border)] bg-[var(--kc-bg)]">
                    <span className="text-[10px] font-mono text-[var(--kc-muted)] block uppercase">Preparation</span>
                    <span className="font-bold text-[var(--kc-ink)] block mt-0.5">
                      {consumptionType === 'eat_directly' ? 'Eat Directly' : 'Needs Cooking'}
                    </span>
                  </div>
                </div>

                {/* Macronutrient Pills */}
                <div className="pt-1">
                  <span className="text-[10px] font-mono text-[var(--kc-muted)] uppercase block mb-1.5">
                    Nutritional Breakdown (per 100g / serving):
                  </span>
                  <div className="grid grid-cols-5 gap-1.5 text-center font-mono text-[11px]">
                    <div className="p-2 rounded-lg bg-[var(--kc-mint)]/40 border border-[var(--kc-card-border)]">
                      <span className="text-[9px] text-[var(--kc-muted)] block">CALORIES</span>
                      <span className="font-bold text-[var(--kc-ink)]">{calories} kcal</span>
                    </div>
                    <div className="p-2 rounded-lg bg-[var(--kc-bg)] border border-[var(--kc-card-border)]">
                      <span className="text-[9px] text-[var(--kc-muted)] block">PROTEIN</span>
                      <span className="font-bold text-[var(--kc-ink)]">{proteinG}g</span>
                    </div>
                    <div className="p-2 rounded-lg bg-[var(--kc-bg)] border border-[var(--kc-card-border)]">
                      <span className="text-[9px] text-[var(--kc-muted)] block">CARBS</span>
                      <span className="font-bold text-[var(--kc-ink)]">{carbsG}g</span>
                    </div>
                    <div className="p-2 rounded-lg bg-[var(--kc-bg)] border border-[var(--kc-card-border)]">
                      <span className="text-[9px] text-[var(--kc-muted)] block">FAT</span>
                      <span className="font-bold text-[var(--kc-ink)]">{fatG}g</span>
                    </div>
                    <div className="p-2 rounded-lg bg-[var(--kc-bg)] border border-[var(--kc-card-border)]">
                      <span className="text-[9px] text-[var(--kc-muted)] block">FIBER</span>
                      <span className="font-bold text-[var(--kc-ink)]">{fiberG}g</span>
                    </div>
                  </div>
                </div>

                {vitaminsList && (
                  <div className="text-[11px] pt-1">
                    <span className="text-[10px] font-mono text-[var(--kc-muted)] uppercase">Vitamins &amp; Micronutrients: </span>
                    <span className="font-medium text-[var(--kc-ink)]">{vitaminsList}</span>
                  </div>
                )}

                {healthAdvisories.length > 0 && (
                  <div className="pt-2 space-y-1.5 border-t border-[var(--kc-hairline)]">
                    <span className="text-[10px] font-mono font-bold text-amber-700 dark:text-amber-400 uppercase block">
                      ⚠️ Dietary &amp; Allergen Precautions ({healthAdvisories.length}):
                    </span>
                    {healthAdvisories.map((adv, idx) => (
                      <div
                        key={idx}
                        className="p-2 rounded-lg text-xs bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200"
                      >
                        <span className="font-bold block">{adv.condition}</span>
                        <span className="text-[11px] opacity-90">{adv.warning}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Status bar & Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-[var(--kc-hairline)]">
                <span className="text-xs font-mono text-[var(--kc-basil)] font-semibold flex items-center gap-1.5">
                  <KhabarIcon name="success" size={14} />
                  <span>All fields determined &amp; populated below!</span>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setCapturedImage(null);
                    setVisionFeedback(null);
                  }}
                  className="px-3.5 py-1.5 text-xs font-mono font-semibold rounded-lg border border-[var(--kc-card-border)] bg-[var(--kc-card)] text-[var(--kc-muted)] hover:text-[var(--kc-ink)] hover:border-[var(--kc-basil)] transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <span>🔄</span>
                  <span>Scan Another Image</span>
                </button>
              </div>
            </div>
          )}

          {cameraError && (
            <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-[var(--kc-chilli)] text-[var(--kc-chilli)] text-xs font-mono rounded-xl">
              {cameraError}
            </div>
          )}
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
