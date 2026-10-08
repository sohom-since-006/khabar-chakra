import { describe, it, expect } from 'vitest';
import { calculateImpact, IMPACT_FACTORS } from '../../src/domain/impact';
import { classifyWasteItem } from '../../src/domain/waste';

describe('Waste and Impact Accounting Domain Logic (Phase 5)', () => {
  it('correctly classifies kitchen waste items into the 5 streams (AC-WASTE-02)', () => {
    expect(classifyWasteItem('Tomato and onion peels').stream).toBe('compost');
    expect(classifyWasteItem('Leftover dry rotis for cattle').stream).toBe('animal_feed');
    expect(classifyWasteItem('Rinsed tin milk can').stream).toBe('dry_recyclables');
    expect(classifyWasteItem('Old mixed fish curry gravy').stream).toBe('municipal_wet');
    expect(classifyWasteItem('Multi-layer metallised chips foil').stream).toBe('landfill');
  });

  it('accurately and idempotently calculates kg diverted and environmental savings (AC-IMPACT-01)', () => {
    const items = [
      { quantityValue: 2, quantityUnit: 'kg', outcome: 'cooked' },
      { quantityValue: 1, quantityUnit: 'kg', outcome: 'consumed' },
      { quantityValue: 500, quantityUnit: 'g', outcome: 'composted' }, // 0.5 kg
      { quantityValue: 1, quantityUnit: 'kg', outcome: 'discarded' }, // discarded
    ];

    const report = calculateImpact(items);

    expect(report.kgDiverted).toBe(3.5);
    expect(report.co2eAvoidedKg).toBe(Math.round(3.5 * IMPACT_FACTORS.CO2E_PER_KG * 10) / 10);
    expect(report.rupeesSaved).toBe(Math.round(3.5 * IMPACT_FACTORS.RUPEES_PER_KG));
    expect(report.mealsSaved).toBe(Math.round(3.5 / IMPACT_FACTORS.MEAL_KG_BENCHMARK));
    expect(report.waterPreservedLitres).toBe(Math.round(3.5 * IMPACT_FACTORS.WATER_LITRES_PER_KG));
  });

  it('preserves transparent source citations and official links for all impact coefficients (AC-IMPACT-02)', () => {
    const report = calculateImpact([]);
    expect(report.citations.co2eCitation).toContain('unep.org');
    expect(report.citations.rupeeValueCitation).toContain('mospi.gov.in');
    expect(report.citations.waterCitation).toContain('fao.org');
  });
});
