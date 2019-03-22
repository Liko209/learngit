/*
 * @Author: Thomas thomas.yang@ringcentral.com
 * @Date: 2019-03-15 18:47:28
 * Copyright © RingCentral. All rights reserved.
 */
import UserPermissionType from '../../module/permission/types';
import { IPermissionService } from '../../module/permission/service/IPermissionService';
import { container } from '../../container';
const soundex = require('soundex-code');

class SearchUtils {
  static isFuzzyMatched(srcText: string, terms: string[]): boolean {
    return srcText.length > 0
      ? terms.every((value: string) => {
        return srcText.includes(value);
      })
      : false;
  }
  static isSoundexMatched(srcText: string, terms: string[]): boolean {
    if (!srcText.length || !terms.length) {
      return false;
    }
    const srcTerms = this.getTermsFromSearchKey(srcText).map(item =>
      soundex(item),
    );
    return terms.every((value: string) => {
      return this.isTextMatchedBySoundex(srcTerms, value);
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
  static isTextMatchedBySoundex(srcText: string[], key: string): boolean {
    return srcText.some((text: string) => {
      return text === key;
    });
  }

  static getTermsFromSearchKey(searchKey: string) {
    return searchKey.split(/[\s,]+/);
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
