/*
 * @Author: Thomas thomas.yang@ringcentral.com
 * @Date: 2019-03-15 18:47:28
 * Copyright © RingCentral. All rights reserved.
 */
class SearchUtils {
  static isFuzzyMatched(srcText: string, terms: string[]): boolean {
    return srcText.length > 0
      ? terms.every((value: string) => {
        return srcText.includes(value);
      })
      : false;
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
}

export { SearchUtils };
