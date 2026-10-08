import { describe, it, expect } from 'vitest';
import { calculateHouseholdNutrition, MANDATORY_MEDICAL_DISCLAIMER } from '../../src/domain/nutrition';

describe('Nutrition Domain Calculator (AC-NUT-01)', () => {
  it('calculates expected targets for a standard 2-adult household', () => {
    const targets = calculateHouseholdNutrition({
      adultMen: 1,
      adultWomen: 1,
      children: 0,
      elderly: 0,
      activityLevel: 'sedentary',
    });

    expect(targets.dailyCalories).toBe(3770);
    expect(targets.dailyProtein).toBe(100);
    expect(targets.dailyFats).toBe(49);
    expect(targets.dailyCarbs).toBeGreaterThan(600);
  });

  it('scales calories and macros with moderate and heavy activity', () => {
    const sedentary = calculateHouseholdNutrition({
      adultMen: 1,
      adultWomen: 0,
      children: 0,
      elderly: 0,
      activityLevel: 'sedentary',
    });

    const heavy = calculateHouseholdNutrition({
      adultMen: 1,
      adultWomen: 0,
      children: 0,
      elderly: 0,
      activityLevel: 'heavy',
    });

    expect(heavy.dailyCalories).toBeGreaterThan(sedentary.dailyCalories);
    expect(heavy.dailyProtein).toBeGreaterThan(sedentary.dailyProtein);
  });

  it('contains the mandatory non-medical disclaimer text (AC-NUT-01)', () => {
    expect(MANDATORY_MEDICAL_DISCLAIMER).toContain('NOT constitute medical, therapeutic, or individual clinical advice');
    expect(MANDATORY_MEDICAL_DISCLAIMER).toContain('ICMR-NIN');
  });
});
