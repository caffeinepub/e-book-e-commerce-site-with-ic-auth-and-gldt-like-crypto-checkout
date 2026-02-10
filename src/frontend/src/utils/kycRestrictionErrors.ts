/**
 * Utility for detecting and mapping KYC restriction errors from backend to user-friendly messages
 */

/**
 * Checks if an error message indicates the new KYC restriction:
 * User has already purchased a KYC-restricted book and cannot purchase additional ones
 */
export function isKycRestrictedPurchaseError(errorMessage: string): boolean {
  const lowerError = errorMessage.toLowerCase();
  
  // Match patterns that indicate the new restriction
  const hasKycKeyword = lowerError.includes('kyc');
  const hasPurchaseKeyword = 
    lowerError.includes('already purchased') || 
    lowerError.includes('previously purchased') ||
    lowerError.includes('have purchased');
  const hasRestrictionKeyword = 
    lowerError.includes('kyc-restricted') || 
    lowerError.includes('restricted') ||
    lowerError.includes('additional') ||
    lowerError.includes('other') ||
    lowerError.includes('another');
  
  return hasKycKeyword && hasPurchaseKeyword && hasRestrictionKeyword;
}

/**
 * Returns a user-friendly error message for the KYC restriction
 */
export function getKycRestrictionErrorMessage(): string {
  return 'You have already purchased a KYC-restricted book with this verified identity. The same identity cannot be used to purchase other KYC-restricted books in the future.';
}

/**
 * Maps backend error messages to user-friendly messages
 */
export function mapKycError(errorMessage: string): string {
  if (isKycRestrictedPurchaseError(errorMessage)) {
    return getKycRestrictionErrorMessage();
  }
  
  // Return original message if no mapping found
  return errorMessage;
}
