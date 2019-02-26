import i18next from 'i18next';
import i18nextXhrBackend from 'i18next-xhr-backend';
import i18nextBrowserLanguagedetector from 'i18next-browser-languagedetector';
import intervalPlural from 'i18next-intervalplural-postprocessor';
import moment from 'moment';
import { reactI18nextModule } from 'react-i18next';
import { toTitleCase } from '@/utils/string';

const getVariationOfAOrAn = function (value: string, capitalize: boolean) {
  const letters = ['a', 'e', 'i', 'o', 'u', 'h'];
  const lastDotChar = value.lastIndexOf('.');
  const actualValue =
    lastDotChar > 0 && lastDotChar !== value.length - 1
      ? value.substring(lastDotChar + 1)
      : value;
  const firstLetter = actualValue.substring(0, 1);
  let correctWordForm = '';
  if (
    letters.find((l: string) => {
      return firstLetter === l;
    })
  ) {
    correctWordForm = capitalize ? 'An' : 'an';
  } else {
    correctWordForm = capitalize ? 'A' : 'a';
  }

  return correctWordForm;
};

const interpolation = {
  format(value: any, format: any, lng: any) {
    if (format === 'titlecase') return toTitleCase(value);
    if (format === 'uppercase') return value.toUpperCase();
    if (format === 'en-handle-an') {
      return getVariationOfAOrAn(value, false);
    }
    if (format === 'en-handle-an-capitalized') {
      return getVariationOfAOrAn(value, true);
    }
    if (value instanceof Date) return moment(value).format(format);
    return value;
  },
  escapeValue: false, // not needed for react!!
};

const config = {
  interpolation,
  fallbackLng: 'en',
  // have a common namespace used around the full app
  ns: ['translations'],
  defaultNS: 'translations',
  debug: true,
  react: { wait: true },
};

const ready = () => {
  moment.locale(i18next.language);
};

i18next
  .use(i18nextXhrBackend)
  .use(i18nextBrowserLanguagedetector)
  .use(reactI18nextModule)
  .use(intervalPlural)
  .init(config, ready);

export default i18next;
