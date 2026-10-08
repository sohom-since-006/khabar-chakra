import { FoodCategory, StorageLocation, WasteRiskLevel } from './types';
import { SHELF_LIFE_DEFAULTS } from './shelfLife';

export interface WasteRiskAssessment {
  riskLevel: WasteRiskLevel;
  riskScore: number; // 0 - 100
  riskExplanation: string;
}

export function assessWasteRisk(params: {
  category: FoodCategory;
  storage: StorageLocation;
  hoursRemaining: number;
  quantityValue: number;
}): WasteRiskAssessment {
  const rule = SHELF_LIFE_DEFAULTS[params.category]?.[params.storage] || SHELF_LIFE_DEFAULTS.other.room;
  
  // Base risk from category perishability (1 to 5 scale -> 20 to 100)
  const categoryRisk = rule.riskWeight * 20;

  // Time decay factor
  let timeFactor = 0;
  if (params.hoursRemaining <= 0) {
    timeFactor = 100;
  } else if (params.hoursRemaining <= rule.redHoursThreshold) {
    timeFactor = 85;
  } else if (params.hoursRemaining <= rule.amberHoursThreshold) {
    timeFactor = 50;
  } else {
    timeFactor = 15;
  }

  // Quantity factor: > 5 units increases urgency
  const quantityFactor = params.quantityValue > 5 ? 15 : 0;

  // Weighted score (time factor is primary 60%, category risk 30%, quantity 10%)
  const rawScore = (timeFactor * 0.6) + (categoryRisk * 0.3) + (quantityFactor * 0.1);
  const riskScore = Math.min(100, Math.round(rawScore));

  let riskLevel: WasteRiskLevel = 'low';
  let riskExplanation = 'Low spoilage risk. Shelf life is steady.';

  if (riskScore >= 70) {
    riskLevel = 'high';
    riskExplanation = 'High waste risk: Item is near expiry or highly perishable. Action recommended.';
  } else if (riskScore >= 40) {
    riskLevel = 'medium';
    riskExplanation = 'Moderate waste risk: Plan consumption in the next meal cycle.';
  }

  return {
    riskLevel,
    riskScore,
    riskExplanation,
  };
}
