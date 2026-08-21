import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import en from './locales/en/common.json';
import am from './locales/am/common.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: { en: { common: en }, am: { common: am } },
    fallbackLng: 'en',
    supportedLngs: ['en', 'am'],
    ns: ['common'],
    defaultNS: 'common',
    interpolation: { escapeValue: false },
    detection: { order: ['localStorage', 'navigator'], caches: ['localStorage'], lookupLocalStorage: 'docuvault-lang' },
  });

i18n.on('languageChanged', language => {
  const nextLanguage = language.startsWith('am') ? 'am' : 'en';
  document.documentElement.lang = nextLanguage;
});

export default i18n;
