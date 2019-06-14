/*
 * @Author: Thomas thomas.yang@ringcentral.com
 * @Date: 2019-01-09 07:52:45
 * Copyright © RingCentral. All rights reserved.
 */

import { caseInsensitive as natureCompare } from 'string-natural-compare';
import { IdModel, ModelIdType } from '../model';
class SortUtils {
  static sortModelByKey<
    T extends IdModel<IdType>,
    IdType extends ModelIdType = number
  >(lhs: T, rhs: T, sortKeys: string[], desc: boolean) {
    let lhsValue: any = undefined;
    let rhsValue: any = undefined;
    for (const key of sortKeys) {
      lhsValue = lhs[key];
      rhsValue = rhs[key];
      if (lhsValue !== rhsValue) {
        break;
      }
    }

    const lhsType = typeof lhsValue;
    const rhsType = typeof rhsValue;
    if (lhsType === rhsType) {
      if (lhsValue !== rhsValue) {
        switch (rhsType) {
          case 'string':
            return desc
              ? natureCompare(rhsValue, lhsValue)
              : natureCompare(lhsValue, rhsValue);
          case 'number':
            return desc ? rhsValue - lhsValue : lhsValue - rhsValue;
        }
      }
      if (typeof lhs.id === 'number' && typeof rhs.id === 'number') {
        return desc ? rhs.id - lhs.id : lhs.id - rhs.id;
      }
      return desc
        ? natureCompare(rhs.id, lhs.id)
        : natureCompare(lhs.id, rhs.id);
    }
    const hasUndefined = lhsValue === undefined || rhsValue === undefined;
    if (hasUndefined) {
      return desc ? (lhsValue ? -1 : 1) : lhsValue ? 1 : -1;
    }
    if (typeof lhs.id === 'number' && typeof rhs.id === 'number') {
      return desc ? rhs.id - lhs.id : lhs.id - rhs.id;
    }
    return desc ? natureCompare(rhs.id, lhs.id) : natureCompare(lhs.id, rhs.id);
  }
}

export { SortUtils };
