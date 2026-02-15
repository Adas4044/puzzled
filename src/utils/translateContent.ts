import { getCachedTranslation, setCachedTranslation } from './translationCache';
import type { Tutorial } from '../types/database';

// Use MyMemory Translation API (free, no API key needed)
// Free tier: 5000 characters/day for anonymous users
// Docs: https://mymemory.translated.net/doc/spec.php
const TRANSLATE_API = 'https://api.mymemory.translated.net/get';

/**
 * Translate a single text string from one language to another
 * Falls back to original text if translation fails
 */
export async function translateText(
  text: string,
  fromLang: string,
  toLang: string
): Promise<string> {
  // No translation needed
  if (!text || fromLang === toLang) return text;

  try {
    const url = `${TRANSLATE_API}?q=${encodeURIComponent(text)}&langpair=${fromLang}|${toLang}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Translation API returned ${response.status}`);
    }

    const data = await response.json();

    // MyMemory API response structure:
    // { responseData: { translatedText: "..." }, responseStatus: 200 }
    const translatedText = data.responseData?.translatedText;

    if (!translatedText) {
      throw new Error('No translated text in response');
    }

    return translatedText;
  } catch (error) {
    console.error('Translation failed:', error);
    // Fallback to original text if translation fails
    return text;
  }
}

/**
 * Translate a single tutorial (title and description)
 * Uses cache when available
 * Preserves all other properties (photoUrl, createdAt, steps)
 */
export async function translateTutorial(
  tutorial: Tutorial,
  language: string
): Promise<Tutorial> {
  // No translation needed for English
  if (language === 'en') return tutorial;

  // Check cache first
  const cachedTitle = getCachedTranslation(tutorial.id, 'title', language);
  const cachedDescription = tutorial.description
    ? getCachedTranslation(tutorial.id, 'description', language)
    : null;

  // If both are cached, use cached versions
  if (cachedTitle && (cachedDescription !== null || !tutorial.description)) {
    return {
      ...tutorial,
      title: cachedTitle,
      description: cachedDescription || tutorial.description,
    };
  }

  // Translate title if not cached
  let translatedTitle = tutorial.title;
  if (!cachedTitle) {
    translatedTitle = await translateText(tutorial.title, 'en', language);
    setCachedTranslation(tutorial.id, 'title', language, translatedTitle);
  } else {
    translatedTitle = cachedTitle;
  }

  // Translate description if exists and not cached
  let translatedDescription = tutorial.description;
  if (tutorial.description && !cachedDescription) {
    translatedDescription = await translateText(tutorial.description, 'en', language);
    setCachedTranslation(tutorial.id, 'description', language, translatedDescription);
  } else if (cachedDescription) {
    translatedDescription = cachedDescription;
  }

  return {
    ...tutorial,
    title: translatedTitle,
    description: translatedDescription,
  };
}

/**
 * Translate multiple tutorials in parallel
 * Returns array with translated titles and descriptions
 * Preserves all other properties for each tutorial
 */
export async function translateTutorials(
  tutorials: Tutorial[],
  language: string
): Promise<Tutorial[]> {
  // No translation needed for English
  if (language === 'en') return tutorials;

  // Translate all tutorials in parallel for better performance
  const translatedTutorials = await Promise.all(
    tutorials.map(tutorial => translateTutorial(tutorial, language))
  );

  return translatedTutorials;
}
