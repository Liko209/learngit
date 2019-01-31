/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-11-26 17:29:02
 * Copyright © RingCentral. All rights reserved.
 */

import { MemberListViewModel } from '../MemberList.ViewModel';
import SortableGroupMemberHandler from '@/store/handler/SortableGroupMemberHandler';

jest.mock('../../../../../../../../store/handler/SectionGroupHandler');

const mockData: number[] = [];
for (let i = 0; i < 50; i++) {
  mockData[i] = i;
}

SortableGroupMemberHandler.createSortableGroupMemberHandler = jest
  .fn()
  .mockResolvedValue({
    getSortedGroupMembersIds: jest.fn().mockReturnValue(mockData),
  });

const props = {
  id: 123,
};
const vm = new MemberListViewModel(props);

describe('MemberListViewModel', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  describe('id', () => {
    it('should be get conversation id when the component is instantiated', () => {
      expect(vm.id).toEqual(props.id);
    });
  });

  describe('memberIds', () => {
    it('should be get correct memberIds when scrolling [JPT-405]', () => {
      const getSortedGroupMembersIds = jest.fn();
      // @ts-ignore
      vm._memberListHandler = {
        getSortedGroupMembersIds,
      };
      // first page
      const firstPageMemberIds = mockData.slice(0, 20);
      getSortedGroupMembersIds.mockReturnValue(firstPageMemberIds);
      expect(vm.memberIds).toMatchObject(firstPageMemberIds);
      // second page
      vm.toBottom(); // next page
      const secondPageMemberIds = mockData.slice(20, 40);
      getSortedGroupMembersIds.mockReturnValue(secondPageMemberIds);
      expect(vm.memberIds).toMatchObject(secondPageMemberIds);
      // third page
      vm.toBottom(); // next page
      const thirdPageMemberIds = mockData.slice(40, 50);
      getSortedGroupMembersIds.mockReturnValue(thirdPageMemberIds);
      expect(vm.memberIds).toMatchObject(thirdPageMemberIds);
      // fourth page
      vm.toBottom(); // next page
    });
  });
});
