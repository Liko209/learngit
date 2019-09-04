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

  const formattedTerms = {
    formattedKeys: [],
    validFormattedKeys: [],
  };

  const formatFunc = (originalTerms: string[]) => {
    return formattedTerms;
  };

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

  describe('getValidPhoneNumber', () => {
    it.each`
      srcStr              | expectRes
      ${'+6504257431'}    | ${'6504257431'}
      ${'+(650)4257-431'} | ${'6504257431'}
      ${'abcd'}           | ${''}
      ${'abcd123456'}     | ${''}
      ${'6504257431'}     | ${'6504257431'}
      ${'650,4257,431'}   | ${'6504257431'}
      ${'650*4257*431'}   | ${'6504257431'}
      ${'650a4257431'}    | ${''}
      ${'6504257431a'}    | ${''}
      ${'#650*4257431'}   | ${'6504257431'}
    `(
      'should return $expectRes when input is $srcStr',
      ({ srcStr, expectRes }) => {
        expect(SearchUtils.getValidPhoneNumber(srcStr)).toBe(expectRes);
      },
    );
  });

  describe('isSpecialChar', () => {
    it.each`
      srcStr | expectRes
      ${'+'} | ${true}
      ${'('} | ${true}
      ${')'} | ${true}
      ${'-'} | ${true}
      ${'*'} | ${true}
      ${'#'} | ${true}
      ${','} | ${true}
      ${'0'} | ${false}
      ${'1'} | ${false}
      ${'9'} | ${false}
      ${'a'} | ${false}
      ${'z'} | ${false}
    `(
      'should return $expectRes when char is $srcStr',
      ({ srcStr, expectRes }) => {
        expect(SearchUtils.isSpecialChar(srcStr)).toBe(expectRes);
      },
    );
  });

  describe('getMatchedWeight', () => {
    it('should return max matched-weight with position matched ', () => {
      const result = SearchUtils.getMatchedWeight(
        ['dora', 'bruce'],
        ['dora', 'bruce'],
        true,
      );
      expect(result).toBe(2.2);
    });

    it('should return max matched-weight without position matched ', () => {
      const result = SearchUtils.getMatchedWeight(
        ['dora', 'bruce'],
        ['dora', 'bruce'],
        false,
      );
      expect(result).toBe(2);
    });

    it('should return one max-matched-weight when only key with start-with matched', () => {
      const result = SearchUtils.getMatchedWeight(
        ['dora', 'bruce'],
        ['dora'],
        true,
      );
      expect(result).toBe(1.1);
    });

    it('should return one max-matched-weight when only one start-with matched', () => {
      const result = SearchUtils.getMatchedWeight(
        ['dora', 'bruce'],
        ['dora', 'uce'],
        true,
      );
      expect(result).toBe(1.1);
    });

    it('should return zero when on one start-with matched', () => {
      const result = SearchUtils.getMatchedWeight(
        ['dora', 'bruce'],
        ['ora', 'uce'],
        true,
      );
      expect(result).toBe(0);
    });
  });

  describe('toDefaultSearchKeyTerms', () => {
    it('should return undefined when search is undefined', () => {
      const term = SearchUtils.toDefaultSearchKeyTerms(undefined);
      expect(term).toEqual({
        searchKey: undefined,
        searchKeyTerms: [],
        searchKeyTermsToSoundex: [],
        searchKeyFormattedTerms: {
          formattedKeys: [],
          validFormattedKeys: [],
        },
      });
    });
    it('should return correct value when search is not undefined', () => {
      const term = SearchUtils.toDefaultSearchKeyTerms('abc');
      expect(term).toEqual({
        searchKey: 'abc',
        searchKeyTerms: [],
        searchKeyTermsToSoundex: [],
        searchKeyFormattedTerms: {
          formattedKeys: [],
          validFormattedKeys: [],
        },
      });
    });
  });

  describe('formatTerms', () => {
    it('should not call format when search key is empty or undefined', () => {
      SearchUtils.getTermsFromText = jest.fn();

      const terms = {
        searchKey: undefined,
        searchKeyTerms: [],
        searchKeyTermsToSoundex: [],
        searchKeyFormattedTerms: {
          formattedKeys: [],
          validFormattedKeys: [],
        },
      };

      SearchUtils.formatTerms(terms, formatFunc);
      expect(SearchUtils.getTermsFromText).not.toHaveBeenCalled();
    });

    it('should call format when search key is valid', async () => {
      SearchUtils.getTermsFromText = jest.fn();
      SearchUtils.isUseSoundex = jest.fn().mockResolvedValue(false);
      const terms = {
        searchKey: 'Abc haa ',
        searchKeyTerms: [],
        searchKeyTermsToSoundex: [],
        searchKeyFormattedTerms: {
          formattedKeys: [],
          validFormattedKeys: [],
        },
      };

      await SearchUtils.formatTerms(terms, formatFunc);
      expect(SearchUtils.getTermsFromText).toHaveBeenCalledWith(
        terms.searchKey.toLowerCase().trim(),
      );
      expect(SearchUtils.isUseSoundex).toHaveBeenCalled();
    });

    it('should call format when search key is valid and has formatFunc', async () => {
      SearchUtils.getTermsFromText = jest.fn();
      SearchUtils.isUseSoundex = jest.fn().mockResolvedValue(false);
      const terms = {
        searchKey: 'Abc haa ',
        searchKeyTerms: [],
        searchKeyTermsToSoundex: [],
        searchKeyFormattedTerms: {
          formattedKeys: [],
          validFormattedKeys: [],
        },
      };

      const formattedTerms = {
        formattedKeys: [
          { original: 'abc', formatted: 'abc' },
          { original: 'haa', formatted: 'haa' },
        ],
        validFormattedKeys: [
          { original: 'abc', formatted: 'abc' },
          { original: 'haa', formatted: 'haa' },
        ],
      };

      await SearchUtils.formatTerms(terms, (originalTerms: string[]) => {
        return formattedTerms;
      });
      expect(SearchUtils.getTermsFromText).toHaveBeenCalledWith(
        terms.searchKey.toLowerCase().trim(),
      );
      expect(SearchUtils.isUseSoundex).toHaveBeenCalled();
      expect(terms.searchKeyFormattedTerms).toEqual(formattedTerms);
    });
  });

  describe('genSearchKeyTerms', () => {
    it('should return correct terms', async () => {
      SearchUtils.formatTerms = jest.fn();
      await SearchUtils.genSearchKeyTerms(undefined, formatFunc);
      expect(SearchUtils.formatTerms).toHaveBeenCalledWith(
        {
          searchKey: undefined,
          searchKeyTerms: [],
          searchKeyTermsToSoundex: [],
          searchKeyFormattedTerms: {
            formattedKeys: [],
            validFormattedKeys: [],
          },
        },
        formatFunc,
      );

      await SearchUtils.genSearchKeyTerms('abc haa', formatFunc);
      expect(SearchUtils.formatTerms).toHaveBeenCalledWith(
        {
          searchKey: 'abc haa',
          searchKeyTerms: [],
          searchKeyTermsToSoundex: [],
          searchKeyFormattedTerms: {
            formattedKeys: [],
            validFormattedKeys: [],
          },
        },
        formatFunc,
      );
    });
  });
});
