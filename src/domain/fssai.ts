export interface FSSAIValidationResult {
  isValid: boolean;
  isFlagged: boolean;
  status: 'verified' | 'missing' | 'unregulated' | 'exempt';
  guidanceNotice?: string;
}

export function validateFSSAI(params: {
  category: string;
  hasLicenseMark: boolean;
  licenseNumber?: string;
}): FSSAIValidationResult {
  // Loose produce, home-cooked food, fruits, vegetables are exempt from packaged FSSAI mandate
  if (['vegetables', 'fruits', 'cooked_food'].includes(params.category)) {
    return {
      isValid: true,
      isFlagged: false,
      status: 'exempt',
    };
  }

  // If marked as missing for commercial packaged food
  if (!params.hasLicenseMark) {
    return {
      isValid: false,
      isFlagged: true,
      status: 'missing',
      guidanceNotice:
        'FSSAI mark not detected on packaged good. Item may not adhere to Indian statutory labelling rules. Verify packaging before consuming; cannot be listed for surplus sharing.',
    };
  }

  // 14-digit FSSAI License validation
  const cleanNumber = (params.licenseNumber || '').trim().replace(/[\s-]/g, '');
  const isValid14Digits = /^[0-9]{14}$/.test(cleanNumber);

  if (!isValid14Digits) {
    return {
      isValid: false,
      isFlagged: true,
      status: 'unregulated',
      guidanceNotice:
        'Provided FSSAI license number is not a valid 14-digit registration. Verify on the official FoSCoS portal (foscos.fssai.gov.in).',
    };
  }

  return {
    isValid: true,
    isFlagged: false,
    status: 'verified',
  };
}
