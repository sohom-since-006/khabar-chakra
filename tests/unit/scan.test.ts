import { describe, it, expect } from 'vitest';
import { queryFoodIntelligence } from '@/domain/foodIntelligence';
import { estimateExpiryDate } from '@/domain/shelfLife';

describe('Domestic Food Intelligence & Kitchen Ingestion', () => {
  it('correctly retrieves domestic pantry staples with nutrition and storage data', async () => {
    const tomato = await queryFoodIntelligence('Fresh Tomatoes');
    expect(tomato.category).toBe('vegetables');
    expect(tomato.suggestedStorage).toBe('fridge');
    expect(tomato.caloriesKcal).toBeGreaterThan(0);
    expect(tomato.consumptionType).toBe('needs_cooking');

    const milk = await queryFoodIntelligence('Toned Cow Milk');
    expect(milk.category).toBe('dairy');
    expect(milk.suggestedStorage).toBe('fridge');
    expect(milk.healthAdvisories.some((a) => a.condition.includes('Lactose'))).toBe(true);
  });

  it('correctly maps regional Bengali/Hindi kitchen names to intelligence records', async () => {
    const potato = await queryFoodIntelligence('alu');
    expect(potato.category).toBe('vegetables');

    const onion = await queryFoodIntelligence('peyaj');
    expect(onion.category).toBe('vegetables');
    expect(onion.suggestedStorage).toBe('room');

    const milk = await queryFoodIntelligence('doodh');
    expect(milk.category).toBe('dairy');
  });

  it('accurately estimates shelf life based on suggested storage zone', async () => {
    const freshBanana = await queryFoodIntelligence('banana');
    const { expiryDate, shelfLifeHours } = estimateExpiryDate(freshBanana.category, freshBanana.suggestedStorage);
    expect(shelfLifeHours).toBeGreaterThan(0);
    expect(expiryDate.getTime()).toBeGreaterThan(Date.now());
  });

  it('flags relevant dietary health advisories for allergen-sensitive foods', async () => {
    const atta = await queryFoodIntelligence('Aashirvaad Chakki Atta');
    expect(atta.healthAdvisories.some((a) => a.condition.includes('Gluten') || a.condition.includes('Celiac'))).toBe(true);

    const fish = await queryFoodIntelligence('Raw Rohu Mach');
    expect(fish.category).toBe('meat_fish_egg');
    expect(fish.healthAdvisories.some((a) => a.condition.includes('Histamine'))).toBe(true);
  });

  it('determines complete pantry and nutritional metadata from an image upload scan', async () => {
    const { POST } = await import('@/app/api/inventory/scan/route');

    // Create a 1x1 transparent pixel sample base64 png
    const sampleImage = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

    const req = new Request('http://localhost:3000/api/inventory/scan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: sampleImage, mode: 'produce' }),
    });

    const res = await POST(req as any);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.name).toBeDefined();
    expect(data.category).toBeDefined();
    expect(data.suggestedStorage).toBeDefined();
    expect(data.shelfLifeDays).toBeGreaterThan(0);
    expect(data.expiryDate).toBeDefined();
    expect(data.consumptionType).toMatch(/eat_directly|needs_cooking/);
    expect(data.calories).toBeGreaterThan(0);
    expect(data.protein).toBeDefined();
    expect(data.carbs).toBeDefined();
    expect(data.fat).toBeDefined();
    expect(data.confidence).toBeGreaterThan(0);
  }, 25000);
});
