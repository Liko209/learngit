/*
 * @Author: Thomas thomas.yang@ringcentral.com
 * @Date: 2019-01-09 07:52:45
 * Copyright © RingCentral. All rights reserved.
 */

import { caseInsensitive as natureCompare } from 'string-natural-compare';

class SortUtils {
  static sortModelByKey(lhs: any, rhs: any, sortKey: string, desc: boolean) {
    const lhsKey = lhs[sortKey];
    const rhsKey = rhs[sortKey];
    const lhsType = typeof lhsKey;
    const rhsType = typeof rhsKey;
    if (lhsType === rhsType) {
      switch (rhsType) {
        case 'string':
        case 'number':
          return desc
            ? natureCompare(rhsKey, lhsKey)
            : natureCompare(lhsKey, rhsKey);
        default:
          return 0;
      }
    }
    return desc ? (lhsKey ? -1 : 1) : lhsKey ? 1 : -1;
  }
}

export { SortUtils };
