/*
 * @Author: steven.zhuang
 * @Date: 2019-07-24 16:48:47
 * Copyright © RingCentral. All rights reserved.
 */

const i18nOptions = {
  fallbackLng: {
    en: ['en'],
    'en-AU': ['en-GB', 'en'],
    de: ['de-DE'],
    es: ['es-ES'],
    fr: ['fr-FR'],
    it: ['it-IT'],
    ja: ['ja-JP'],
    pt: ['pt-BR'],
    zh: ['zh-CN'],
    'zh-HK': ['zh-TW', 'zh-CN'],
    default: ['en'],
  },
  whitelist: [
    'en',
    'de-DE',
    'en-GB',
    'es-419',
    'es-ES',
    'fr-CA',
    'fr-FR',
    'it-IT',
    'ja-JP',
    'pt-BR',
    'zh-CN',
    'zh-TW',
  ],
};

export default i18nOptions;
