/*
 * @Author: Thomas thomas.yang@ringcentral.com
 * @Date: 2019-01-09 07:52:45
 * Copyright © RingCentral. All rights reserved.
 */

import { caseInsensitive as natureCompare } from 'string-natural-compare';
import { IdModel, ModelIdType, SortableModel } from '../model';
import { randomInt } from 'sdk/utils';

const DEFAULT_PARTIAL_SORT_MIN_COUNT = 100;

class SortUtils {
  static sortModelByKey<
    T extends IdModel<IdType>,
    IdType extends ModelIdType = number
  >(lhs: T, rhs: T, sortKeys: string[], desc: boolean) {
    let lhsValue: any;
    let rhsValue: any;
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
          default:
            break;
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

  static compareSortableModel<T>(lhs: SortableModel<T>, rhs: SortableModel<T>) {
    let result = SortUtils.compareArrayOfSameLens(
      rhs.sortWeights,
      lhs.sortWeights,
    );

    if (result === 0) {
      if (lhs.lowerCaseName < rhs.lowerCaseName) {
        result = -1;
      } else if (lhs.lowerCaseName > rhs.lowerCaseName) {
        result = 1;
      }
    }

    return result;
  }

  static compareArrayOfSameLens(arrA: number[], arrB: number[]) {
    const len = arrA.length;
    let i = 0;
    while (i < len) {
      const res = arrA[i] - arrB[i];
      if (res !== 0) {
        return res;
      }
      i++;
    }

    return 0;
  }

  static partialSort<T>(
    dataArray: T[],
    sortFunc: (lv: T, rv: T) => number,
    sortCount: number,
  ): T[] {
    if (dataArray.length < sortCount) {
      return dataArray.sort(sortFunc);
    }
    return this._partition(dataArray, sortFunc, sortCount).sort(sortFunc);
  }

  private static _partition<T>(
    dataArray: T[],
    sortFunc: (lv: T, rv: T) => number,
    sortCount: number,
  ): T[] {
    if (dataArray.length === sortCount) {
      return dataArray;
    }
    if (dataArray.length < DEFAULT_PARTIAL_SORT_MIN_COUNT) {
      return dataArray.sort(sortFunc).slice(0, sortCount);
    }

    const base = dataArray[randomInt() % dataArray.length];
    const lArray: T[] = [];
    const rArray: T[] = [];
    dataArray.forEach((data: T) => {
      if (sortFunc(data, base) === -1) {
        lArray.push(data);
      } else {
        rArray.push(data);
      }
    });
    if (lArray.length < sortCount) {
      return lArray.concat(
        this._partition(rArray, sortFunc, sortCount - lArray.length),
      );
    }
    return this._partition(lArray, sortFunc, sortCount);
  }
}

export { SortUtils };
