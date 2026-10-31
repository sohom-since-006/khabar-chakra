import { describe, it, expect } from 'vitest';
import { findPackagedProduct, searchPackagedProducts, PACKAGED_FOOD_DATABASE } from '../src/domain/packagedFoodDatabase';
import { queryFoodIntelligence } from '../src/domain/foodIntelligence';

describe('Packaged Food Intelligence & FMCG Registry', () => {
  it('contains verified authentic products from top manufacturers', () => {
    expect(PACKAGED_FOOD_DATABASE.length).toBeGreaterThan(30);

    const manufacturers = new Set(PACKAGED_FOOD_DATABASE.map((p) => p.manufacturer));
    expect(manufacturers.has('Britannia Industries Limited')).toBe(true);
    expect(manufacturers.has('Parle Products Pvt. Ltd.')).toBe(true);
    expect(manufacturers.has('ITC Limited')).toBe(true);
    expect(manufacturers.has('Mondelez India Foods Private Limited')).toBe(true);
    expect(manufacturers.has('Nestlé India Limited')).toBe(true);
    expect(manufacturers.has('PepsiCo India Holdings Pvt. Ltd.')).toBe(true);
    expect(manufacturers.has('Gujarat Co-operative Milk Marketing Federation Ltd. (GCMMF)')).toBe(true);
    expect(manufacturers.has('Haldiram Foods International Pvt. Ltd.')).toBe(true);
  });

  describe('Britannia Products & Barcode Accuracy', () => {
    it('retrieves Britannia Gobbles Fruity Fun by barcode', () => {
      const match = findPackagedProduct('', '8901063138446');
      expect(match).not.toBeNull();
      expect(match?.name).toBe('Britannia Gobbles Fruity Fun Bar Cake');
      expect(match?.manufacturer).toBe('Britannia Industries Limited');
      expect(match?.brand).toBe('Britannia Gobbles');
      expect(match?.category).toBe('bread_bakery');
      expect(match?.consumptionType).toBe('eat_directly');
      expect(match?.suggestedStorage).toBe('room');
      expect(match?.caloriesKcal).toBe(416);
      expect(match?.carbsG).toBe(64.0);
      expect(match?.fatG).toBe(15.2);
      expect(match?.sugarsG).toBe(29.5);
      expect(match?.shelfLifeDays).toBe(90);
      expect(match?.fssaiLicense).toBe('10015043001129');
    });

    it('matches Britannia Gobbles from noisy OCR text tokens', () => {
      const ocrSnippet = 'BRITANNIA GOBBLES Fruity Fun Bar Cake Net Wt 110g Exp 12/2026 Mfd By Britannia Industries';
      const match = findPackagedProduct(ocrSnippet);
      expect(match).not.toBeNull();
      expect(match?.name).toBe('Britannia Gobbles Fruity Fun Bar Cake');
      expect(match?.brand).toBe('Britannia Gobbles');
      expect(match?.suggestedStorage).toBe('room');
      expect(match?.consumptionType).toBe('eat_directly');
    });

    it('retrieves Britannia Good Day Butter Cookies', () => {
      const match = findPackagedProduct('good day butter cookies');
      expect(match).not.toBeNull();
      expect(match?.name).toBe('Britannia Good Day Butter Cookies');
      expect(match?.manufacturer).toBe('Britannia Industries Limited');
      expect(match?.suggestedStorage).toBe('room');
      expect(match?.caloriesKcal).toBe(492);
    });

    it('retrieves Britannia Treat Croissant', () => {
      const match = findPackagedProduct('creamy cocoa croissant britannia');
      expect(match).not.toBeNull();
      expect(match?.name).toBe('Britannia Treat Croissant (Creamy Cocoa)');
      expect(match?.category).toBe('bread_bakery');
      expect(match?.consumptionType).toBe('eat_directly');
      expect(match?.suggestedStorage).toBe('room');
    });
  });

  describe('Parle & ITC Products Accuracy', () => {
    it('retrieves Parle-G Original Gluco Biscuits by barcode', () => {
      const match = findPackagedProduct('', '8901719101012');
      expect(match).not.toBeNull();
      expect(match?.name).toBe('Parle-G Original Gluco Biscuits');
      expect(match?.manufacturer).toBe('Parle Products Pvt. Ltd.');
      expect(match?.category).toBe('bread_bakery');
      expect(match?.consumptionType).toBe('eat_directly');
      expect(match?.suggestedStorage).toBe('room');
      expect(match?.caloriesKcal).toBe(454);
    });

    it('retrieves Parle Hide & Seek Cookies from search query', () => {
      const match = findPackagedProduct('parle hide and seek choco chip');
      expect(match).not.toBeNull();
      expect(match?.name).toBe('Parle Hide & Seek Chocolate Chip Cookies');
      expect(match?.manufacturer).toBe('Parle Products Pvt. Ltd.');
      expect(match?.suggestedStorage).toBe('room');
      expect(match?.caloriesKcal).toBe(482);
    });

    it('retrieves Sunfeast Dark Fantasy Choco Fills', () => {
      const match = findPackagedProduct('sunfeast dark fantasy molten choco fills');
      expect(match).not.toBeNull();
      expect(match?.name).toBe('Sunfeast Dark Fantasy Choco Fills Cookies');
      expect(match?.manufacturer).toBe('ITC Limited');
      expect(match?.suggestedStorage).toBe('room');
      expect(match?.consumptionType).toBe('eat_directly');
      expect(match?.caloriesKcal).toBe(512);
    });

    it('retrieves Bingo! Tedhe Medhe', () => {
      const match = findPackagedProduct('bingo tedhe medhe masala tadka');
      expect(match).not.toBeNull();
      expect(match?.name).toBe('Bingo! Tedhe Medhe Masala Tadka Snack');
      expect(match?.manufacturer).toBe('ITC Limited');
      expect(match?.category).toBe('packaged');
      expect(match?.suggestedStorage).toBe('room');
      expect(match?.caloriesKcal).toBe(558);
    });
  });

  describe('Cadbury & Nestlé Products Accuracy', () => {
    it('retrieves Cadbury Dairy Milk Chocolate', () => {
      const match = findPackagedProduct('cadbury dairy milk chocolate bar');
      expect(match).not.toBeNull();
      expect(match?.name).toBe('Cadbury Dairy Milk Chocolate Bar');
      expect(match?.manufacturer).toBe('Mondelez India Foods Private Limited');
      expect(match?.suggestedStorage).toBe('room');
      expect(match?.consumptionType).toBe('eat_directly');
      expect(match?.caloriesKcal).toBe(534);
    });

    it('retrieves Cadbury Dairy Milk Silk Roast Almond', () => {
      const match = findPackagedProduct('silk roast almond');
      expect(match).not.toBeNull();
      expect(match?.name).toBe('Cadbury Dairy Milk Silk Roast Almond Chocolate');
      expect(match?.manufacturer).toBe('Mondelez India Foods Private Limited');
    });

    it('retrieves Nestlé Maggi 2-Minute Masala Noodles with cooking requirement', () => {
      const match = findPackagedProduct('nestle maggi 2 minute noodles masala');
      expect(match).not.toBeNull();
      expect(match?.name).toBe('Nestlé Maggi 2-Minute Masala Instant Noodles');
      expect(match?.manufacturer).toBe('Nestlé India Limited');
      expect(match?.category).toBe('packaged');
      expect(match?.consumptionType).toBe('needs_cooking');
      expect(match?.suggestedStorage).toBe('room');
      expect(match?.caloriesKcal).toBe(427);
      expect(match?.sodiumMg).toBe(1020);
    });

    it('retrieves Nestlé KitKat Crisp Wafer', () => {
      const match = findPackagedProduct('nestle kitkat 4 finger');
      expect(match).not.toBeNull();
      expect(match?.name).toBe('Nestlé KitKat 4-Finger Crisp Wafer Chocolate Bar');
      expect(match?.manufacturer).toBe('Nestlé India Limited');
      expect(match?.consumptionType).toBe('eat_directly');
      expect(match?.caloriesKcal).toBe(518);
    });
  });

  describe('PepsiCo & Haldirams Accuracy', () => {
    it("retrieves Lay's Magic Masala Potato Chips", () => {
      const match = findPackagedProduct("lays india's magic masala");
      expect(match).not.toBeNull();
      expect(match?.name).toBe("Lay's India's Magic Masala Potato Chips");
      expect(match?.manufacturer).toBe('PepsiCo India Holdings Pvt. Ltd.');
      expect(match?.category).toBe('packaged');
      expect(match?.suggestedStorage).toBe('room');
      expect(match?.caloriesKcal).toBe(546);
    });

    it("retrieves Haldiram's Nagpur Aloo Bhujia", () => {
      const match = findPackagedProduct("haldiram's nagpur aloo bhujia");
      expect(match).not.toBeNull();
      expect(match?.name).toBe("Haldiram's Nagpur Aloo Bhujia Spiced Potato Sev");
      expect(match?.manufacturer).toBe('Haldiram Foods International Pvt. Ltd.');
      expect(match?.suggestedStorage).toBe('room');
      expect(match?.caloriesKcal).toBe(582);
    });
  });

  describe('queryFoodIntelligence Packaged Goods Integration', () => {
    it('returns authentic manufacturer details when querying food intelligence', async () => {
      const intel = await queryFoodIntelligence('Britannia Gobbles Fruity Fun');
      expect(intel.name).toBe('Britannia Gobbles Fruity Fun Bar Cake');
      expect(intel.brand).toBe('Britannia Gobbles');
      expect(intel.manufacturer).toBe('Britannia Industries Limited');
      expect(intel.category).toBe('bread_bakery');
      expect(intel.consumptionType).toBe('eat_directly');
      expect(intel.suggestedStorage).toBe('room');
      expect(intel.caloriesKcal).toBe(416);
      expect(intel.sugarsG).toBe(29.5);
    });

    it('never classifies packaged cakes or biscuits as raw vegetables in fridge', async () => {
      const cakeIntel = await queryFoodIntelligence('gobbles fruit cake');
      expect(cakeIntel.category).not.toBe('vegetables');
      expect(cakeIntel.suggestedStorage).not.toBe('fridge');
      expect(cakeIntel.consumptionType).toBe('eat_directly');

      const biscuitIntel = await queryFoodIntelligence('oreo biscuits');
      expect(biscuitIntel.category).not.toBe('vegetables');
      expect(biscuitIntel.suggestedStorage).toBe('room');
      expect(biscuitIntel.consumptionType).toBe('eat_directly');
    });
  });
});
