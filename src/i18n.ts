import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';

// Supported languages for MVP
export const SUPPORTED_LANGUAGES = ['en', 'es', 'fr'];

i18n
  .use(Backend) // Load translations from public/locales
  .use(LanguageDetector) // Detect user language
  .use(initReactI18next) // React integration
  .init({
    fallbackLng: 'en',
    supportedLngs: SUPPORTED_LANGUAGES,

    // Namespace configuration
    ns: ['common', 'language', 'tutorial', 'camera', 'instruction', 'errors', 'help'],
    defaultNS: 'common',

    // Backend configuration
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    },

    // Language detection
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'puzzled_language',
    },

    // Development options
    debug: import.meta.env.DEV,

    // Interpolation
    interpolation: {
      escapeValue: false, // React already escapes
    },

    // Load only current language (not all 3!)
    load: 'currentOnly',

    // React-specific
    react: {
      useSuspense: true, // Use Suspense for loading state
    },
  });

export default i18n;
