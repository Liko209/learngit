/*
 * @Author: steven.zhuang
 * @Date: 2019-07-24 15:52:05
 * Copyright © RingCentral. All rights reserved.
 */

import LanguageUtil from 'i18next/dist/commonjs/LanguageUtils';
import i18nextBrowserLanguagedetector from 'i18next-browser-languagedetector';
import i18nOptions from '../i18nOptions';

const languageUtils = new LanguageUtil({
  whitelist: i18nOptions.whitelist,
  fallbackLng: i18nOptions.fallbackLng,
});
const servicesMock = {
  languageUtils,
  logger: {
    log: console,
  },
};
const detector = new i18nextBrowserLanguagedetector(servicesMock, {
  lookupLocalStorage: 'i18nextUserLng',
  caches: [],
});
detector.logger = console;
detector.i18nOptions = {
  fallbackLng: i18nOptions.fallbackLng,
};

describe('i18n language detector', () => {
  it('JPT-2621 Should fallback to that close language rather than to en_US if set to other supported languages', () => {
    const result = detector.foundInDetectedWithFallbacks(['fr-CH', 'zh-CN']);
    expect(result).toEqual('fr-FR');
  });
  it('JPT-2625 Should fallback to en-US if set to other un-supported languages', () => {
    const result = detector.foundInDetectedWithFallbacks(['ar', 'abc']);
    expect(result).toEqual('en');
  });
});
