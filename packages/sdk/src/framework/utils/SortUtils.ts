/*
 * @Author: Thomas thomas.yang@ringcentral.com
 * @Date: 2019-01-09 07:52:45
 * Copyright © RingCentral. All rights reserved.
 */

import { caseInsensitive as natureCompare } from 'string-natural-compare';
import { IdModel } from '../model';
class SortUtils {
  static sortModelByKey<T extends IdModel>(
    lhs: T,
    rhs: T,
    sortKey: string,
    desc: boolean,
  ) {
    const lhsValue = lhs[sortKey];
    const rhsValue = rhs[sortKey];
    const lhsType = typeof lhsValue;
    const rhsType = typeof rhsValue;
    if (lhsType === rhsType && lhsValue !== rhsValue) {
      switch (rhsType) {
        case 'string':
          return desc
            ? natureCompare(rhsValue, lhsValue)
            : natureCompare(lhsValue, rhsValue);
        case 'number':
          return desc ? rhsValue - lhsValue : lhsValue - rhsValue;
        default:
          break;
      }
    }
    // use id to sort
    return desc ? rhs.id - lhs.id : lhs.id - rhs.id;
  }
}

export { SortUtils };
