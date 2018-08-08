import i18next from 'i18next';
import i18nextXhrBackend from 'i18next-xhr-backend';
import i18nextBrowserLanguagedetector from 'i18next-browser-languagedetector';
import moment from 'moment';
import { reactI18nextModule } from 'react-i18next';

i18next
  .use(i18nextXhrBackend)
  .use(i18nextBrowserLanguagedetector)
  .use(reactI18nextModule)
  .init({
    fallbackLng: 'en',

    // have a common namespace used around the full app
    ns: ['translations'],
    defaultNS: 'translations',

    debug: true,

    interpolation: {
      format(value: any, format: any, lng: any) {
        if (format === 'uppercase') return value.toUpperCase();
        if (value instanceof Date) return moment(value).format(format);
        return value;
      },
      escapeValue: false, // not needed for react!!
    },

    react: {
      wait: true,
    },
  });

export default i18next;
