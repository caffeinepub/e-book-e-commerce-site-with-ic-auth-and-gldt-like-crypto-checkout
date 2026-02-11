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
 * Applies import mode to catalog data
 * Note: The backend importCatalog method always performs a full overwrite.
 * For merge mode, the client must first export the current catalog, merge it with the imported data,
 * and then import the merged result.
 */
export function applyCatalogImportMode(
  existingCatalog: CatalogState,
  importedCatalog: CatalogState,
  mode: ImportMode
): CatalogState {
  if (mode === 'overwrite') {
    return importedCatalog;
  }

  // Merge mode: combine existing and imported data
  // For arrays of tuples, we merge by key (first element of tuple)
  const mergeArrays = <K, V>(existing: Array<[K, V]>, imported: Array<[K, V]>): Array<[K, V]> => {
    const map = new Map<K, V>();
    
    // Add existing entries
    for (const [key, value] of existing) {
      map.set(key, value);
    }
    
    // Overwrite with imported entries (imported takes precedence)
    for (const [key, value] of imported) {
      map.set(key, value);
    }
    
    return Array.from(map.entries());
  };

  return {
    userProfiles: mergeArrays(existingCatalog.userProfiles, importedCatalog.userProfiles),
    bookStore: mergeArrays(existingCatalog.bookStore, importedCatalog.bookStore),
    cartStore: mergeArrays(existingCatalog.cartStore, importedCatalog.cartStore),
    orderStore: mergeArrays(existingCatalog.orderStore, importedCatalog.orderStore),
    balanceStore: mergeArrays(existingCatalog.balanceStore, importedCatalog.balanceStore),
    ownedBooks: mergeArrays(existingCatalog.ownedBooks, importedCatalog.ownedBooks),
    supportMessages: mergeArrays(existingCatalog.supportMessages, importedCatalog.supportMessages),
    kycIdToPrincipal: mergeArrays(existingCatalog.kycIdToPrincipal, importedCatalog.kycIdToPrincipal),
    principalToKycId: mergeArrays(existingCatalog.principalToKycId, importedCatalog.principalToKycId),
    purchasesByCustomerId: mergeArrays(existingCatalog.purchasesByCustomerId, importedCatalog.purchasesByCustomerId),
    permanentlyBlacklisted: mergeArrays(existingCatalog.permanentlyBlacklisted, importedCatalog.permanentlyBlacklisted),
    validationTimestamps: mergeArrays(existingCatalog.validationTimestamps, importedCatalog.validationTimestamps),
    kycRestrictedPurchases: mergeArrays(existingCatalog.kycRestrictedPurchases, importedCatalog.kycRestrictedPurchases),
    nextMessageId: Math.max(
      Number(existingCatalog.nextMessageId),
      Number(importedCatalog.nextMessageId)
    ) as any,
    designatedOwner: importedCatalog.designatedOwner || existingCatalog.designatedOwner,
  };
}
