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
      soundexOfEntity                         | soundexOfSearchTerms                   | expectRes
      ${[soundex('Thomas'), soundex('Yang')]} | ${[soundex('thomas')]}                 | ${true}
      ${[soundex('Thomas'), soundex('Yang')]} | ${[soundex('thmas')]}                  | ${true}
      ${[soundex('Thomas'), soundex('Yang')]} | ${[soundex('thm')]}                    | ${false}
      ${[soundex('Thomas'), soundex('Yang')]} | ${[soundex('ying'), soundex('thmas')]} | ${true}
      ${[soundex('Thomas'), soundex('Yang')]} | ${[soundex('yin'), soundex('thom')]}   | ${false}
      ${[soundex('Thomas')]}                  | ${[soundex('thoms'), soundex('yin')]}  | ${false}
      ${[soundex('Thomas')]}                  | ${[soundex('thoms')]}                  | ${true}
      ${[soundex('')]}                        | ${[soundex('yin'), soundex('thom')]}   | ${false}
    `(
      'fuzzy match: $srcText, $searchKey, $expectRes',
      ({ soundexOfEntity, soundexOfSearchTerms, expectRes }) => {
        expect(
          SearchUtils.isSoundexMatched(soundexOfEntity, soundexOfSearchTerms),
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

  describe('getTermsFromText', () => {
    it('should return a array when key is paynter chen', () => {
      expect(SearchUtils.getTermsFromText('paynter chen')).toEqual([
        'paynter',
        'chen',
      ]);
    });

    it.each`
      srcStr          | expectRes
      ${'123,456'}    | ${['123', '456']}
      ${'123_456'}    | ${['123', '456']}
      ${'123-456'}    | ${['123', '456']}
      ${'123.456'}    | ${['123', '456']}
      ${'1,2_3-4.56'} | ${['1', '2', '3', '4', '56']}
    `(
      'should split src $srcStr and return $expectRes',
      ({ srcStr, expectRes }) => {
        expect(SearchUtils.getTermsFromText(srcStr)).toEqual(expectRes);
      },
    );
  });
});
