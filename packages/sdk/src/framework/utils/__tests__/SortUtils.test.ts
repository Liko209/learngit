import { SortUtils } from '../SortUtils';
import { array } from '@storybook/addon-knobs';
import { SortableModel, IdModel } from 'sdk/framework/model';

/*
 * @Author: Thomas thomas.yang@ringcentral.com
 * @Date: 2019-01-09 16:59:37
 * Copyright © RingCentral. All rights reserved.
 */

describe('SortUtils', () => {
  const groupId = 1;
  const item1 = {
    id: 1,
    group_ids: [groupId],
    created_at: 1,
    name: 'item1',
    sameSortKey: '1',
    diffSortKey: {},
    mightUndefined: undefined,
  };
  const item2 = {
    id: 2,
    group_ids: [groupId],
    created_at: 2,
    name: 'item2',
    sameSortKey: '1',
    diffSortKey: 'other',
    mightUndefined: 111,
  };

  const item3 = {
    id: 3,
    group_ids: [groupId],
    created_at: 3,
    name: 'item3',
    sameSortKey: '1',
    diffSortKey: 1,
    mightUndefined: undefined,
  };

  it('should return sorted items by name', () => {
    const items = [item1, item2, item3];
    const sortFn = (lhs: any, rhs: any) => {
      return SortUtils.sortModelByKey(lhs, rhs, ['name'], true);
    };
    expect(items.sort(sortFn)).toEqual([item3, item2, item1]);
  });

  it('should return sorted items by created_at', () => {
    const items = [item1, item2, item3];
    const sortFn = (lhs: any, rhs: any) => {
      return SortUtils.sortModelByKey(lhs, rhs, ['created_at'], false);
    };
    expect(items.sort(sortFn)).toEqual([item1, item2, item3]);
  });

  it('should return sorted items by default order', () => {
    const items = [item2, item1, item3];
    const sortFn = (lhs: any, rhs: any) => {
      return SortUtils.sortModelByKey(lhs, rhs, ['jjj'], false);
    };
    expect(items.sort(sortFn)).toEqual(items);
  });

  it('should sort by id when sort value is same', () => {
    const items = [item2, item1, item3];
    const sortFn = (lhs: any, rhs: any) => {
      return SortUtils.sortModelByKey(lhs, rhs, ['sameSortKey'], false);
    };
    expect(items.sort(sortFn)).toEqual([item1, item2, item3]);
  });

  it('should sort by id desc when sort value is same', () => {
    const items = [item2, item1, item3];
    const sortFn = (lhs: any, rhs: any) => {
      return SortUtils.sortModelByKey(lhs, rhs, ['sameSortKey'], true);
    };
    expect(items.sort(sortFn)).toEqual([item3, item2, item1]);
  });

  it('should sort by id when sort value has different type', () => {
    const items = [item2, item1, item3];
    const sortFn = (lhs: any, rhs: any) => {
      return SortUtils.sortModelByKey(lhs, rhs, ['diffSortKey'], false);
    };
    expect(items.sort(sortFn)).toEqual([item1, item2, item3]);
  });

  it('should sort by id when sort value has different type', () => {
    const items = [item2, item1, item3];
    const sortFn = (lhs: any, rhs: any) => {
      return SortUtils.sortModelByKey(lhs, rhs, ['diffSortKey'], false);
    };
    expect(items.sort(sortFn)).toEqual([item1, item2, item3]);
  });

  it('should sort by sort value first, if sort value is undefined, then use id to sort', () => {
    const items = [item1, item2, item3];
    const sortFn = (lhs: any, rhs: any) => {
      return SortUtils.sortModelByKey(lhs, rhs, ['mightUndefined'], false);
    };
    expect(items.sort(sortFn)).toEqual([item1, item3, item2]);
  });

  it('should sort by id when no sort key provided', () => {
    const items = [item2, item1, item3];
    const sortFn = (lhs: any, rhs: any) => {
      return SortUtils.sortModelByKey(lhs, rhs, [], false);
    };
    expect(items.sort(sortFn)).toEqual([item1, item2, item3]);
  });

  it('should sort by next sort key when previous sort value is same', () => {
    const items = [item2, item1, item3];
    const sortFn = (lhs: any, rhs: any) => {
      return SortUtils.sortModelByKey(
        lhs,
        rhs,
        ['sameSortKey', 'created_at'],
        false,
      );
    };
    expect(items.sort(sortFn)).toEqual([item1, item2, item3]);
  });

  describe('compareArrayOfSameLens', () => {
    it.each`
      arrA         | arrB         | res
      ${[1]}       | ${[1]}       | ${0}
      ${[1, 2]}    | ${[1, 2]}    | ${0}
      ${[1, 3]}    | ${[1, 2]}    | ${1}
      ${[1, -2]}   | ${[1, -3]}   | ${1}
      ${[1, 2]}    | ${[1, 3]}    | ${-1}
      ${[1, 2, 3]} | ${[1, 3, 2]} | ${-1}
    `('$arrA compare to $arrB, res is: $res', ({ arrA, arrB, res }) => {
      const result = SortUtils.compareArrayOfSameLens(arrA, arrB);
      expect(result).toBe(res);
    });
  });

  describe('compareSortableModel', () => {
    const compareModels = [
      { id: 1, sortWeights: [1, 2, 3], lowerCaseName: 'b' },
      { id: 2, sortWeights: [1, 2, 4], lowerCaseName: 'b' },
      { id: 3, sortWeights: [1, 2, 4], lowerCaseName: 'a' },
      { id: 4, sortWeights: [1, 2, 4], lowerCaseName: 'a a' },
    ];
    it('should return expected order', () => {
      const res = compareModels.sort((a: any, b: any) =>
        SortUtils.compareSortableModel(a, b),
      );

      expect(res.map(x => x.id)).toEqual([3, 4, 2, 1]);
    });
  });
});
