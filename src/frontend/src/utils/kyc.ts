/**
 * Derives a stable KYC identifier from document type and number
 */
export function deriveKycIdentifier(
  documentType: 'id' | 'birth-certificate',
  documentNumber: string
): string {
  const trimmed = documentNumber.trim().replace(/\s+/g, ' ');
  const prefix = documentType === 'id' ? 'ID' : 'BC';
  return `${prefix}-${trimmed}`;
}

/**
 * Validates a document number
 */
export function validateDocumentNumber(documentNumber: string): {
  isValid: boolean;
  error?: string;
} {
  const trimmed = documentNumber.trim();

  if (!trimmed) {
    return {
      isValid: false,
      error: 'Please enter your document number',
    };
  }

  if (trimmed.length < 5) {
    return {
      isValid: false,
      error: 'Document number must contain at least 5 characters',
    };
  }

  return { isValid: true };
}
