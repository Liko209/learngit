/*
 * @Author: Thomas thomas.yang@ringcentral.com
 * @Date: 2019-01-09 07:52:45
 * Copyright © RingCentral. All rights reserved.
 */

import { caseInsensitive as natureCompare } from 'string-natural-compare';

class SortUtils {
  static sortModelByKey<T extends {}>(
    lhs: T,
    rhs: T,
    sortKey: string,
    desc: boolean,
  ) {
    const lhsValue = lhs[sortKey];
    const rhsValue = rhs[sortKey];
    const lhsType = typeof lhsValue;
    const rhsType = typeof rhsValue;
    if (lhsType === rhsType) {
      switch (rhsType) {
        case 'string':
        case 'number':
          return desc
            ? natureCompare(rhsValue, lhsValue)
            : natureCompare(lhsValue, rhsValue);
        default:
          return 0;
      }
    }
    return desc ? (lhsValue ? -1 : 1) : lhsValue ? 1 : -1;
  }
}

export { SortUtils };
