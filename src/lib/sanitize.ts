/**
 * Input sanitization and XSS protection helpers
 * Enforces strict XSS filtering and privacy masking for Khabar Chakra.
 */

// Regex patterns to detect and mask phone numbers and email addresses
const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/gi;
// Indian phone number patterns (+91-XXXXX-XXXXX, 9830012345, 09830012345, with spaces/dashes)
const PHONE_REGEX = /(?:\+91[\s.-]?)?(?:[6-9]\d{9}|[6-9]\d{4}[\s.-]?\d{5}|\d{3}[\s.-]?\d{3}[\s.-]?\d{4})/g;

/**
 * Strips script tags, javascript: URIs, onerror/onload attributes, and dangerous markup.
 */
export function sanitizeText(input: string): string {
  if (!input) return '';
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .replace(/<embed\b[^<]*>/gi, '')
    .replace(/<object\b[^<]*>/gi, '')
    .trim();
}

/**
 * Masks phone numbers and emails inside public descriptions (AGENTS.md §3.2 & Decision D2).
 */
export function maskPrivateContactInfo(text: string): string {
  if (!text) return '';
  return text
    .replace(EMAIL_REGEX, '[email protected]')
    .replace(PHONE_REGEX, '[phone hidden]');
}

/**
 * Complete sanitization pipeline for user-submitted form strings
 */
export function sanitizeUserInput(text: string, maskContacts: boolean = true): string {
  let cleaned = sanitizeText(text);
  if (maskContacts) {
    cleaned = maskPrivateContactInfo(cleaned);
  }
  return cleaned;
}
