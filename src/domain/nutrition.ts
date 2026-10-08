export interface HouseholdProfile {
  adultMen: number;
  adultWomen: number;
  children: number;
  elderly: number;
  activityLevel: 'sedentary' | 'moderate' | 'heavy';
}

export interface NutritionTargets {
  dailyCalories: number; // kcal
  dailyProtein: number;  // grams
  dailyCarbs: number;    // grams
  dailyFats: number;     // grams
}

export const MANDATORY_MEDICAL_DISCLAIMER =
  'Statutory Notice: The nutritional estimates and meal recommendations provided by Khabar Chakra are general reference calculations based on ICMR-NIN dietary guidelines. They do NOT constitute medical, therapeutic, or individual clinical advice. Always consult a qualified medical professional or registered dietitian for specific dietary requirements, allergies, or health conditions.';

export function calculateHouseholdNutrition(profile: HouseholdProfile): NutritionTargets {
  const activityMultiplier =
    profile.activityLevel === 'heavy'
      ? 1.45
      : profile.activityLevel === 'moderate'
      ? 1.22
      : 1.0;

  // Baseline RDA per person (ICMR-NIN Indian Reference 2020)
  const menCalories = profile.adultMen * 2110 * activityMultiplier;
  const womenCalories = profile.adultWomen * 1660 * activityMultiplier;
  const childrenCalories = profile.children * 1360 * activityMultiplier;
  const elderlyCalories = profile.elderly * 1700 * activityMultiplier;

  const totalCalories = Math.round(menCalories + womenCalories + childrenCalories + elderlyCalories);

  // Protein RDA (approx 0.83g - 1.0g per kg reference weight)
  const menProtein = profile.adultMen * 54;
  const womenProtein = profile.adultWomen * 46;
  const childrenProtein = profile.children * 32;
  const elderlyProtein = profile.elderly * 48;
  const totalProtein = Math.round((menProtein + womenProtein + childrenProtein + elderlyProtein) * (profile.activityLevel === 'heavy' ? 1.2 : 1.0));

  // Fats (~20-25g baseline visible/invisible fat balance)
  const menFats = profile.adultMen * 27;
  const womenFats = profile.adultWomen * 22;
  const childrenFats = profile.children * 25;
  const elderlyFats = profile.elderly * 22;
  const totalFats = Math.round((menFats + womenFats + childrenFats + elderlyFats) * (profile.activityLevel === 'heavy' ? 1.25 : 1.0));

  // Carbs = Remaining calories / 4 kcal/g
  const proteinCalories = totalProtein * 4;
  const fatCalories = totalFats * 9;
  const remainingCalories = Math.max(0, totalCalories - (proteinCalories + fatCalories));
  const totalCarbs = Math.round(remainingCalories / 4);

  return {
    dailyCalories: Math.max(1200, totalCalories),
    dailyProtein: Math.max(30, totalProtein),
    dailyCarbs: Math.max(100, totalCarbs),
    dailyFats: Math.max(20, totalFats),
  };
}
