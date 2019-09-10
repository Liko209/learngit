/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-11-26 17:29:02
 * Copyright © RingCentral. All rights reserved.
 */

import { MemberListViewModel } from '../MemberList.ViewModel';
import { MemberListProps } from '../types';
import SortableGroupMemberHandler from '@/store/handler/SortableGroupMemberHandler';
import { getGlobalValue } from '@/store/utils';
import { GLOBAL_KEYS } from '@/store/constants';

jest.mock('sdk/dao');
jest.mock('@/store/handler/SectionGroupHandler');

const props: MemberListProps = {
  id: 1,
  filteredMemberIds: [],
  sortedAllMemberIds: [],
  width: 1,
  height: 1,
  searchInput: 'search',
  setShowEmpty: (flag: boolean) => {},
};

const allMembersIds: number[] = [];
for (let i = 0; i < 50; i++) {
  allMembersIds[i] = i;
}

SortableGroupMemberHandler.createSortableGroupMemberHandler = jest
  .fn()
  .mockResolvedValue({
    getSortedGroupMembersIds: jest.fn().mockReturnValue(allMembersIds),
  });

describe('MemberListViewModel', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  describe('onScrollEvent()', () => {
    it('should be true when scrollTop is greater than 20', () => {
      const vm = new MemberListViewModel(props);
      vm.onScrollEvent({ currentTarget: { scrollTop: 40 } });
      expect(
        getGlobalValue(GLOBAL_KEYS.IS_SHOW_MEMBER_LIST_HEADER_SHADOW),
      ).toBe(true);
    });

    it('should be true when scrollTop is less than 20', () => {
      const vm = new MemberListViewModel(props);
      vm.onScrollEvent({ currentTarget: { scrollTop: 10 } });
      expect(
        getGlobalValue(GLOBAL_KEYS.IS_SHOW_MEMBER_LIST_HEADER_SHADOW),
      ).toBe(false);
    });
  });
});
