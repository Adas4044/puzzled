// Translation Cache Utility for storing tutorial translations in localStorage
// Key format: "puzzled_translation_<id>_<field>_<language>"
// Example: "puzzled_translation_123_title_es"

interface CacheEntry {
  text: string;
  timestamp: number;
}

const CACHE_PREFIX = 'puzzled_translation_';
const CACHE_EXPIRY = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

/**
 * Get a cached translation from localStorage
 * Returns null if not found or expired
 */
export function getCachedTranslation(
  id: string,
  field: string,
  language: string
): string | null {
  const key = `${CACHE_PREFIX}${id}_${field}_${language}`;
  const cached = localStorage.getItem(key);

  if (!cached) return null;

  try {
    const entry: CacheEntry = JSON.parse(cached);
    const isExpired = Date.now() - entry.timestamp > CACHE_EXPIRY;

    if (isExpired) {
      localStorage.removeItem(key);
      return null;
    }

    return entry.text;
  } catch {
    // Invalid JSON, remove it
    localStorage.removeItem(key);
    return null;
  }
}

/**
 * Cache a translation in localStorage with timestamp
 */
export function setCachedTranslation(
  id: string,
  field: string,
  language: string,
  text: string
): void {
  const key = `${CACHE_PREFIX}${id}_${field}_${language}`;
  const entry: CacheEntry = {
    text,
    timestamp: Date.now(),
  };

  try {
    localStorage.setItem(key, JSON.stringify(entry));
  } catch (e) {
    // Quota exceeded - try clearing old translations
    console.warn('localStorage quota exceeded, clearing old translations');
    clearOldTranslations();

    // Try again after clearing
    try {
      localStorage.setItem(key, JSON.stringify(entry));
    } catch {
      console.error('Failed to cache translation even after clearing');
    }
  }
}

/**
 * Clear expired translations from localStorage
 */
function clearOldTranslations(): void {
  const keys = Object.keys(localStorage);
  const now = Date.now();

  keys
    .filter(key => key.startsWith(CACHE_PREFIX))
    .forEach(key => {
      try {
        const cached = localStorage.getItem(key);
        if (!cached) return;

        const entry: CacheEntry = JSON.parse(cached);
        if (now - entry.timestamp > CACHE_EXPIRY) {
          localStorage.removeItem(key);
        }
      } catch {
        // Invalid entry, remove it
        localStorage.removeItem(key);
      }
    });
}

/**
 * Clear all translation cache (useful for testing or manual reset)
 */
export function clearAllTranslationCache(): void {
  const keys = Object.keys(localStorage);
  keys
    .filter(key => key.startsWith(CACHE_PREFIX))
    .forEach(key => localStorage.removeItem(key));

  console.log('All translation cache cleared');
}
