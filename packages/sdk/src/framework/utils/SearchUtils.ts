/*
 * @Author: Thomas thomas.yang@ringcentral.com
 * @Date: 2019-03-15 18:47:28
 * Copyright © RingCentral. All rights reserved.
 */
import UserPermissionType from '../../module/permission/types';
import { IPermissionService } from '../../module/permission/service/IPermissionService';
import { container } from '../../container';

const SplitTermsSymbols = new RegExp(/[\s,._-]+/);

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
}

export { SearchUtils };
