/*
 * @Author: Thomas thomas.yang@ringcentral.com
 * @Date: 2019-03-17 12:24:36
 * Copyright © RingCentral. All rights reserved.
 */

import { SearchUtils } from '../SearchUtils';
const soundex = require('soundex-code');
function clearMocks() {
  jest.clearAllMocks();
  jest.resetAllMocks();
  jest.restoreAllMocks();
}

describe('SearchUtils', () => {
  beforeEach(() => {
    clearMocks();
  });

  describe('isFuzzyMatched', () => {
    it.each`
      srcText        | searchKey       | expectRes
      ${'good day'}  | ${['oo']}       | ${true}
      ${'good day'}  | ${['da']}       | ${true}
      ${'good day'}  | ${['oo', 'da']} | ${true}
      ${'good day'}  | ${['o', 'da']}  | ${true}
      ${'good day'}  | ${['od', 'da']} | ${true}
      ${'good day'}  | ${['g']}        | ${true}
      ${'jerry cai'} | ${['j']}        | ${true}
    `(
      'fuzzy match: $srcText, $searchKey, $expectRes',
      ({ srcText, searchKey, expectRes }) => {
        expect(SearchUtils.isFuzzyMatched(srcText, searchKey)).toBe(expectRes);
      },
    );

    it('should return false when is not FuzzyMatched', () => {
      expect(SearchUtils.isFuzzyMatched('good day', ['p'])).toBeFalsy();
    });
  });
  describe('isSoundexMatch', () => {
    it.each`
      srcText          | searchKeyTermsToSoundex                | expectRes
      ${'Thomas Yang'} | ${[soundex('thomas')]}                 | ${true}
      ${'Thomas Yang'} | ${[soundex('thmas')]}                  | ${true}
      ${'Thomas Yang'} | ${[soundex('thm')]}                    | ${false}
      ${'Thomas Yang'} | ${[soundex('ying'), soundex('thmas')]} | ${true}
      ${'Thomas Yang'} | ${[soundex('yin'), soundex('thom')]}   | ${false}
    `(
      'fuzzy match: $srcText, $searchKey, $expectRes',
      ({ srcText, searchKeyTermsToSoundex, expectRes }) => {
        expect(
          SearchUtils.isSoundexMatched(srcText, searchKeyTermsToSoundex),
        ).toBe(expectRes);
      },
    );

    it('should return false when is not FuzzyMatched', () => {
      expect(SearchUtils.isFuzzyMatched('good day', ['p'])).toBeFalsy();
    });
  });
  describe('isStartWithMatched', () => {
    it('should return true when start with matched', () => {
      expect(SearchUtils.isStartWithMatched('good day', ['goo'])).toBeTruthy();
    });

    it('should return false when start with not matched', () => {
      expect(SearchUtils.isStartWithMatched('good day', ['goop'])).toBeFalsy();
    });
  });

  describe('isTextMatchedBySoundex', () => {
    it('should return true when matched', () => {
      expect(
        SearchUtils.isTextMatchedBySoundex(['V390', 'V490'], 'V390'),
      ).toBeTruthy();
    });
    it('should return false when not matched', () => {
      expect(
        SearchUtils.isTextMatchedBySoundex(['V590', 'V490'], 'V390'),
      ).toBeFalsy();
    });
  });
  describe('getTermsFromSearchKey', () => {
    it('should return a array when key is paynter chen', () => {
      expect(SearchUtils.getTermsFromSearchKey('paynter chen')).toEqual([
        'paynter',
        'chen',
      ]);
    });
  });
});
