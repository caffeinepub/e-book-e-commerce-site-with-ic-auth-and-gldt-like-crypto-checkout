import type { CatalogState } from '@/backend';

export type ImportMode = 'overwrite' | 'merge';

/**
 * Validates that the imported JSON matches the expected CatalogState shape
 */
export function validateCatalogState(data: unknown): data is CatalogState {
  if (!data || typeof data !== 'object') {
    return false;
  }

  const catalog = data as any;

  // Check required fields exist and are arrays
  const requiredArrayFields = [
    'userProfiles',
    'bookStore',
    'cartStore',
    'orderStore',
    'balanceStore',
    'ownedBooks',
    'supportMessages',
    'kycIdToPrincipal',
    'principalToKycId',
    'purchasesByCustomerId',
    'permanentlyBlacklisted',
    'validationTimestamps',
    'kycRestrictedPurchases',
  ];

  for (const field of requiredArrayFields) {
    if (!Array.isArray(catalog[field])) {
      return false;
    }
  }

  // Check nextMessageId is a number
  if (typeof catalog.nextMessageId !== 'bigint' && typeof catalog.nextMessageId !== 'number') {
    return false;
  }

  return true;
}

/**
 * Parses imported JSON file content into CatalogState
 */
export async function parseCatalogFile(file: File): Promise<CatalogState> {
  const text = await file.text();
  
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch (error) {
    throw new Error('Invalid JSON file. Please upload a valid catalog export file.');
  }

  if (!validateCatalogState(parsed)) {
    throw new Error('Invalid catalog format. The file does not match the expected catalog structure.');
  }

  return parsed as CatalogState;
}

/**
 * Applies import mode to merge or overwrite catalog data
 */
export function applyCatalogImportMode(
  existingCatalog: CatalogState,
  newCatalog: CatalogState,
  mode: ImportMode
): CatalogState {
  if (mode === 'overwrite') {
    // Complete replacement
    return newCatalog;
  }

  // Merge mode: combine data, with new catalog taking precedence for conflicts
  const mergeArrays = <T extends [any, any]>(existing: T[], incoming: T[]): T[] => {
    const map = new Map<string, T>();
    
    // Add existing entries
    for (const entry of existing) {
      const key = String(entry[0]);
      map.set(key, entry);
    }
    
    // Overwrite/add with incoming entries
    for (const entry of incoming) {
      const key = String(entry[0]);
      map.set(key, entry);
    }
    
    return Array.from(map.values());
  };

  return {
    userProfiles: mergeArrays(existingCatalog.userProfiles, newCatalog.userProfiles),
    bookStore: mergeArrays(existingCatalog.bookStore, newCatalog.bookStore),
    cartStore: mergeArrays(existingCatalog.cartStore, newCatalog.cartStore),
    orderStore: mergeArrays(existingCatalog.orderStore, newCatalog.orderStore),
    balanceStore: mergeArrays(existingCatalog.balanceStore, newCatalog.balanceStore),
    ownedBooks: mergeArrays(existingCatalog.ownedBooks, newCatalog.ownedBooks),
    supportMessages: mergeArrays(existingCatalog.supportMessages, newCatalog.supportMessages),
    kycIdToPrincipal: mergeArrays(existingCatalog.kycIdToPrincipal, newCatalog.kycIdToPrincipal),
    principalToKycId: mergeArrays(existingCatalog.principalToKycId, newCatalog.principalToKycId),
    purchasesByCustomerId: mergeArrays(existingCatalog.purchasesByCustomerId, newCatalog.purchasesByCustomerId),
    permanentlyBlacklisted: mergeArrays(existingCatalog.permanentlyBlacklisted, newCatalog.permanentlyBlacklisted),
    validationTimestamps: mergeArrays(existingCatalog.validationTimestamps, newCatalog.validationTimestamps),
    kycRestrictedPurchases: mergeArrays(existingCatalog.kycRestrictedPurchases, newCatalog.kycRestrictedPurchases),
    // Use incoming value for scalar fields
    nextMessageId: newCatalog.nextMessageId,
    designatedOwner: newCatalog.designatedOwner,
  };
}
