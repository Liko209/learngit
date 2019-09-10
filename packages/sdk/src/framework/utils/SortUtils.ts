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
      result = SortUtils.compareLowerCaseString(
        lhs.lowerCaseName,
        rhs.lowerCaseName,
      );
    }

    return result;
  }

  static compareLowerCaseString(stringA: string, stringB: string) {
    if (stringA < stringB) {
      return -1;
    }

    if (stringA > stringB) {
      return 1;
    }
    return 0;
  }

  static compareString(stringA: string, stringB: string) {
    return SortUtils.compareLowerCaseString(
      stringA ? stringA.toLowerCase() : '',
      stringB ? stringB.toLowerCase() : '',
    );
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
    if (!sortCount) {
      return [];
    }
    if (dataArray.length <= sortCount) {
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

  static heapSort<T>(
    dataArray: T[],
    sortFunc: (lv: T, rv: T) => number,
    sortCount: number,
  ): T[] {
    if (!sortCount) {
      return [];
    }
    if (dataArray.length <= sortCount) {
      return dataArray.sort(sortFunc);
    }

    // generate heap
    const heap: T[] = dataArray.slice(0, sortCount);
    for (let index = ~~(sortCount / 2 - 1); index >= 0; --index) {
      this._adjustHeap(heap, sortFunc, index, sortCount);
    }

    // sort
    for (let index = sortCount; index < dataArray.length; ++index) {
      if (sortFunc(dataArray[index], heap[0]) === -1) {
        heap[0] = dataArray[index];
        this._adjustHeap(heap, sortFunc, 0, sortCount);
      }
    }

    return this._getSortedArrayFromHeap(heap, sortFunc, sortCount);
  }

  private static _adjustHeap<T>(
    heap: T[],
    sortFunc: (lv: T, rv: T) => number,
    parent: number,
    sortCount: number,
  ): void {
    let child = parent * 2 + 1;
    while (parent < sortCount) {
      if (
        child + 1 < sortCount &&
        sortFunc(heap[child], heap[child + 1]) === -1
      ) {
        ++child;
      }
      if (child < sortCount && sortFunc(heap[parent], heap[child]) === -1) {
        // swap
        const temp = heap[parent];
        heap[parent] = heap[child];
        heap[child] = temp;

        parent = child;
        child = parent * 2 + 1;
      } else {
        break;
      }
    }
  }

  private static _getSortedArrayFromHeap<T>(
    heap: T[],
    sortFunc: (lv: T, rv: T) => number,
    sortCount: number,
  ): T[] {
    for (let heapLength = sortCount; heapLength > 1; --heapLength) {
      // swap
      const temp = heap[0];
      heap[0] = heap[heapLength - 1];
      heap[heapLength - 1] = temp;

      // adjust
      this._adjustHeap(heap, sortFunc, 0, heapLength - 1);
    }
    return heap;
  }
}

export { SortUtils };
