/*
 * @Author: Thomas thomas.yang@ringcentral.com
 * @Date: 2019-03-15 18:47:28
 * Copyright © RingCentral. All rights reserved.
 */
import UserPermissionType from 'sdk/module/permission/types';
import { IPermissionService } from 'sdk/module/permission/service/IPermissionService';
import { container } from 'sdk/container';
import _ from 'lodash';
import { UndefinedAble } from 'sdk/types';
import { FormattedTerms, Terms } from 'sdk/framework/search';

const SplitTermsSymbols = new RegExp(/[\s,._-]+/);
const kSortingRateWithFirstMatched: number = 1;
const kSortingRateWithFirstAndPositionMatched: number = 1.1;

const soundex = require('soundex-code');

class SearchUtils {
  static isFuzzyMatched(srcText: string, terms: string[]): boolean {
    return srcText.length > 0
      ? terms.every((value: string) => {
          return srcText.includes(value);
        })
      : false;
  }

  static isSoundexMatched(
    soundexOfEntity: string[],
    soundexOfSearchTerms: string[],
  ): boolean {
    if (!soundexOfEntity.length || !soundexOfSearchTerms.length) {
      return false;
    }
    return soundexOfSearchTerms.every((value: string) => {
      return soundexOfEntity.includes(value);
    });
  }

  static isStartWithMatched(srcText: string, terms: string[]): boolean {
    if (srcText.length > 0) {
      for (let i = 0; i < terms.length; ++i) {
        if (srcText.startsWith(terms[i])) {
          return true;
        }
      }
    }
    return false;
  }

  static getMatchedWeight(
    lowerCaseSplitNames: string[],
    searchKeyTerms: string[],
    isPositionMatchedHigher: boolean,
  ) {
    let sortValue = 0;

    const setKeyMatched: Set<string> = new Set();
    for (let i = 0; i < lowerCaseSplitNames.length; ++i) {
      for (let j = 0; j < searchKeyTerms.length; ++j) {
        if (
          !setKeyMatched.has(searchKeyTerms[j]) &&
          SearchUtils.isStartWithMatched(lowerCaseSplitNames[i], [
            searchKeyTerms[j],
          ])
        ) {
          setKeyMatched.add(searchKeyTerms[j]);
          sortValue +=
            i === j && isPositionMatchedHigher
              ? kSortingRateWithFirstAndPositionMatched
              : kSortingRateWithFirstMatched;
        }
      }
    }

    return sortValue;
  }

  static getTermsFromText(searchKey: string) {
    return searchKey.split(SplitTermsSymbols);
  }

  static async isUseSoundex(): Promise<boolean> {
    const permissionService: IPermissionService = container.get(
      'PermissionService',
    );
    return await permissionService.hasPermission(
      UserPermissionType.JUPITER_SEARCH_SUPPORT_BY_SOUNDEX,
    );
  }

  static getValidPhoneNumber(value: string): string {
    let result: string = '';
    /* eslint-disable no-continue */
    for (let i = 0; i < value.length; ++i) {
      const c = value.charAt(i);
      if (SearchUtils.isSpecialChar(c)) {
        continue;
      }

      if (_.isNaN(parseInt(c, 10))) {
        return '';
      }

      result = result.concat(c);
    }
    return result;
  }

  static isSpecialChar(c: string) {
    return (
      c === '+' ||
      c === '(' ||
      c === ')' ||
      c === '-' ||
      c === '*' ||
      c === '#' ||
      c === ','
    );
  }

  static toDefaultSearchKeyTerms(searchKey: UndefinedAble<string>) {
    const terms: Terms = {
      searchKey,
      searchKeyTerms: [],
      searchKeyTermsToSoundex: [],
      searchKeyFormattedTerms: {
        formattedKeys: [],
        validFormattedKeys: [],
      },
    };
    return terms;
  }

  static async genSearchKeyTerms(
    searchKey: UndefinedAble<string>,
    genFormattedTermsFunc: UndefinedAble<
      (originalTerms: string[]) => FormattedTerms
    >,
  ) {
    const terms: Terms = SearchUtils.toDefaultSearchKeyTerms(searchKey);
    await SearchUtils.formatTerms(terms, genFormattedTermsFunc);
    return terms;
  }

  static async formatTerms(
    terms: Terms,
    genFormattedTermsFunc: UndefinedAble<
      (originalTerms: string[]) => FormattedTerms
    >,
  ) {
    if (terms.searchKey) {
      terms.searchKeyTerms = SearchUtils.getTermsFromText(
        terms.searchKey.toLowerCase().trim(),
      );

      if (genFormattedTermsFunc) {
        terms.searchKeyFormattedTerms = genFormattedTermsFunc(
          terms.searchKeyTerms,
        );
      }

      const isUseSoundex = await SearchUtils.isUseSoundex();
      if (isUseSoundex) {
        terms.searchKeyTermsToSoundex = terms.searchKeyTerms.map(item =>
          soundex(item),
        );
      }
    }
  }
}

export { SearchUtils };
