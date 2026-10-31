import { InventoryItem } from '@/domain/types';

/**
 * Patterns matching old legacy seed/mock food items that should never exist
 * in a real user's private household inventory.
 */
const FAKE_ITEM_PATTERNS = [
  /chholar dal/i,
  /spinach\s*\(palak\)/i,
  /raw mutton/i,
  /red cow/i,
  /amul milk & spinach/i,
  /seed_\d+/i,
  /sample/i,
];

/**
 * Returns true if an item is a fake or mock seed item.
 */
export function isMockItem(item: Partial<InventoryItem> | null | undefined): boolean {
  if (!item) return true;
  if (typeof item.id === 'string' && (item.id.startsWith('seed_') || item.id.startsWith('mock_'))) {
    return true;
  }
  const name = item.name;
  if (typeof name === 'string' && FAKE_ITEM_PATTERNS.some((pattern) => pattern.test(name))) {
    return true;
  }
  return false;
}

/**
 * Safely retrieves inventory from localStorage and strictly purges any legacy mock/fake items.
 * If mock items are found, they are permanently removed from the user's browser localStorage.
 */
export function getCleanInventory(): InventoryItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem('kc-inventory');
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    const cleaned: InventoryItem[] = parsed.filter((item) => !isMockItem(item));

    // If fake items were pruned, overwrite localStorage immediately so they never return
    if (cleaned.length !== parsed.length) {
      localStorage.setItem('kc-inventory', JSON.stringify(cleaned));
    }

    return cleaned;
  } catch {
    return [];
  }
}

/**
 * Saves inventory items to localStorage, guaranteeing no mock/fake items can be inserted.
 */
export function saveCleanInventory(items: InventoryItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    const cleaned = (items || []).filter((item) => !isMockItem(item));
    localStorage.setItem('kc-inventory', JSON.stringify(cleaned));
  } catch {
    // quota or access fallback
  }
}
