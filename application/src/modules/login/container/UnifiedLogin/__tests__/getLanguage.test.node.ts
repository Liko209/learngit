/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-09-10 13:24:34
 * Copyright © RingCentral. All rights reserved.
 */

import i18next from 'i18next';
import { getLanguage } from '../helper';

describe('getLanguage method', () => {
  beforeEach(() => {
    i18next.init();
  });

  it('support language', async () => {
    const lng = 'fr-CA';
    i18next.changeLanguage(lng);
    expect(getLanguage()).toBe(lng);
  });

  it('completely unsupported language', async () => {
    const lng = 'zh-CN';
    i18next.changeLanguage(lng);
    expect(getLanguage()).toBe('en-US');
  });

  it('using the default language', async () => {
    const lng = 'en';
    i18next.changeLanguage(lng);
    expect(getLanguage()).toBe('en-US');
  });

  it('using the default language', async () => {
    const lng = 'en-CA';
    i18next.changeLanguage(lng);
    expect(getLanguage()).toBe('en-US');
  });
});
