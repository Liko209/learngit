import { SortUtils } from '../SortUtils';

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
      return SortUtils.sortModelByKey(lhs, rhs, 'name', true);
    };
    expect(items.sort(sortFn)).toEqual([item3, item2, item1]);
  });

  it('should return sorted items by created_at', () => {
    const items = [item1, item2, item3];
    const sortFn = (lhs: any, rhs: any) => {
      return SortUtils.sortModelByKey(lhs, rhs, 'created_at', false);
    };
    expect(items.sort(sortFn)).toEqual([item1, item2, item3]);
  });

  it('should return sorted items by default order', () => {
    const items = [item2, item1, item3];
    const sortFn = (lhs: any, rhs: any) => {
      return SortUtils.sortModelByKey(lhs, rhs, 'jjj', false);
    };
    expect(items.sort(sortFn)).toEqual(items);
  });

  it('should sort by id when sort value is same', () => {
    const items = [item2, item1, item3];
    const sortFn = (lhs: any, rhs: any) => {
      return SortUtils.sortModelByKey(lhs, rhs, 'sameSortKey', false);
    };
    expect(items.sort(sortFn)).toEqual([item1, item2, item3]);
  });

  it('should sort by id desc when sort value is same', () => {
    const items = [item2, item1, item3];
    const sortFn = (lhs: any, rhs: any) => {
      return SortUtils.sortModelByKey(lhs, rhs, 'sameSortKey', true);
    };
    expect(items.sort(sortFn)).toEqual([item3, item2, item1]);
  });

  it('should sort by id when sort value has different type', () => {
    const items = [item2, item1, item3];
    const sortFn = (lhs: any, rhs: any) => {
      return SortUtils.sortModelByKey(lhs, rhs, 'diffSortKey', false);
    };
    expect(items.sort(sortFn)).toEqual([item1, item2, item3]);
  });

  it('should sort by id when sort value has different type', () => {
    const items = [item2, item1, item3];
    const sortFn = (lhs: any, rhs: any) => {
      return SortUtils.sortModelByKey(lhs, rhs, 'diffSortKey', false);
    };
    expect(items.sort(sortFn)).toEqual([item1, item2, item3]);
  });

  it('should sort by sort value first, if sort value is undefined, then use id to sort', () => {
    const items = [item1, item2, item3];
    const sortFn = (lhs: any, rhs: any) => {
      return SortUtils.sortModelByKey(lhs, rhs, 'mightUndefined', false);
    };
    expect(items.sort(sortFn)).toEqual([item1, item3, item2]);
  });
});
