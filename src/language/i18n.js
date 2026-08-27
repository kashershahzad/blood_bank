import {initReactI18next} from 'react-i18next';
import i18n from 'i18next';

import enTranslations from './english.json';
import arTranslations from './arabic.json';

i18n
  .use(initReactI18next) // Initialize react-i18next
  .init({
    lng: 'en', // Default language
    fallbackLng: 'en', // Fallback language
    resources: {
      en: {
        translation: enTranslations, // English translations
      },
      ar: {
        translation: arTranslations, // Arabic translations
      },
    },
  });

export default i18n;
