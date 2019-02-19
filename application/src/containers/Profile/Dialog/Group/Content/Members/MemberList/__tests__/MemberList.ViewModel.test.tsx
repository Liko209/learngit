/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-11-26 17:29:02
 * Copyright © RingCentral. All rights reserved.
 */

import { MemberListViewModel } from '../MemberList.ViewModel';
import SortableGroupMemberHandler from '@/store/handler/SortableGroupMemberHandler';

jest.mock('../../../../../../../../store/handler/SectionGroupHandler');

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

  describe('memberIds', () => {
    it('should be get correct memberIds when scrolling [JPT-405]', () => {
      const vm = new MemberListViewModel();
      const getSortedGroupMembersIds = jest.fn();
      // @ts-ignore
      vm._memberListHandler = {
        getSortedGroupMembersIds,
      };
      getSortedGroupMembersIds.mockReturnValue(allMembersIds);
      expect(vm.memberIds).toEqual(allMembersIds);
    });
  });
});
