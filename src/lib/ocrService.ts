import { createWorker } from 'tesseract.js';

export interface OcrResult {
  rawText: string;
  confidence: number;
  detectedBarcode?: string;
  detectedExpiry?: string;
  detectedQuantity?: string;
  detectedFssai?: string;
  lines: string[];
}

let cachedWorker: any = null;

async function getWorker() {
  if (!cachedWorker) {
    cachedWorker = await createWorker('eng');
  }
  return cachedWorker;
}

/**
 * Performs fast OCR text recognition on an image buffer and extracts food packaging metadata
 */
export async function performPackagingOcr(imageBuffer: Buffer): Promise<OcrResult> {
  try {
    const worker = await getWorker();
    const ret = await worker.recognize(imageBuffer);
    const rawText = (ret.data?.text || '').trim();
    const confidence = ret.data?.confidence || 85;

    const lines = rawText
      .split(/\r?\n/)
      .map((l: string) => l.trim())
      .filter((l: string) => l.length > 0);

    // Extract barcode (Indian EAN-13 starts with 890, or international 800/888/12-13 digits)
    let detectedBarcode: string | undefined;
    const barcodeMatch = rawText.match(/\b(890\d{10}|800\d{10}|888\d{10}|\d{12,13})\b/);
    if (barcodeMatch) {
      detectedBarcode = barcodeMatch[1];
    }

    // Extract printed expiry dates (e.g. EXP: 25/12/2026, USE BY 15/10/26, BEST BEFORE 3 MONTHS)
    let detectedExpiry: string | undefined;
    const expMatch = rawText.match(/(?:exp(?:iry)?|use\s*by|best\s*before|mfd|bb)[:\s]+(\d{1,2}[-/.](?:\d{1,2}|[a-z]{3})[-/.]\d{2,4}|\d+\s*(?:days?|hours?|months?))/i);
    if (expMatch) {
      detectedExpiry = expMatch[1];
    }

    // Extract net quantity / weight (e.g. "Net Wt: 110 g", "Net Qty: 200g", "1L", "500 ml")
    let detectedQuantity: string | undefined;
    const qtyMatch = rawText.match(/(?:net\s*(?:wt|qty|weight)?[:\s]*)?(\d+(?:\.\d+)?)\s*(kg|g|gm|gms|l|ml|pcs|pack)\b/i);
    if (qtyMatch) {
      detectedQuantity = `${qtyMatch[1]} ${qtyMatch[2]}`;
    }

    // Extract FSSAI license number (e.g. Lic No: 10015043001129)
    let detectedFssai: string | undefined;
    const fssaiMatch = rawText.match(/(?:fssai|lic(?:ense)?\.?\s*(?:no\.?)?)[:\s]*(\d{14})/i);
    if (fssaiMatch) {
      detectedFssai = fssaiMatch[1];
    }

    return {
      rawText,
      confidence,
      detectedBarcode,
      detectedExpiry,
      detectedQuantity,
      detectedFssai,
      lines,
    };
  } catch (error) {
    console.error('OCR analysis failed:', error);
    return {
      rawText: '',
      confidence: 0,
      lines: [],
    };
  }
}
