/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-09-10 09:37:59
 * Copyright © RingCentral. All rights reserved.
 */

import i18next from 'i18next';

function getLanguage() {
  const lng = i18next.language;
  const arr = lng.split('-');
  const map = {
    de: ['DE'],
    en: ['US', 'GB'],
    es: ['ES', '419'],
    fr: ['FR', 'CA'],
    it: ['IT'],
    pt: ['BR'],
    ja: ['JP'],
  };
  const locals = map[arr[0]];
  if (!locals) {
    return 'en-US';
  }
  const local = locals.find((l: string) => l === arr[1]);
  if (!local) {
    return `${arr[0]}-${locals[0]}`;
  }
  return lng;
}

export { getLanguage };

// const map = {
//   'de-DE': 'de-DE', // Deutsch
//   'en-GB': 'en-GB', // English (U.K.)
//   'en-US': 'en-US', // English (U.S.)
//   'es-ES': 'es-ES', // Español
//   'es-419': 'es-419', // Español (Latinoamérica)
//   'fr-FR': 'fr-FR', // Français
//   'fr-CA': 'fr-CA', // Français (Canada)
//   'it-IT': 'it-IT', // Italiano
//   'pt-BR': 'pt-BR', // Português (Brasil)
//   'ja-JP': 'ja-JP', // 日本語
// };
