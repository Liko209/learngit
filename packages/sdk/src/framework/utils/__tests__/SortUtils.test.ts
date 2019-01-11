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
  };
  const item2 = {
    id: 2,
    group_ids: [groupId],
    created_at: 2,
    name: 'item2',
  };

  const item3 = {
    id: 3,
    group_ids: [groupId],
    created_at: 3,
    name: 'item3',
  };

  it('should return sorted items', () => {
    const items = [item1, item2, item3];
    const sortFn = (lhs: any, rhs: any) => {
      return SortUtils.sortModelByKey(lhs, rhs, 'name', true);
    };
    expect(items.sort(sortFn)).toEqual([item3, item2, item1]);
  });
});
