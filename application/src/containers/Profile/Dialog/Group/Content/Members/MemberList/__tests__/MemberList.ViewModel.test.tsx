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

describe('MemberList.ViewModel', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  it('should be get conversation id when the component is instantiated', () => {
    expect(vm.id).toEqual(props.id);
  });

  it('should be get correct memberIds when scrolling [JPT-405]', () => {
    // first page
    const firstPageMemberIds = mockData.slice(0, 20);
    jest.spyOn(vm, 'memberIds', 'get').mockReturnValue(firstPageMemberIds);
    expect(vm.memberIds).toMatchObject(firstPageMemberIds);
    // second page
    vm.toBottom();
    const secondPageMemberIds = mockData.slice(20, 40);
    jest.spyOn(vm, 'memberIds', 'get').mockReturnValue(secondPageMemberIds);
    expect(vm.memberIds).toMatchObject(secondPageMemberIds);
    // third page
    vm.toBottom();
    const thirdPageMemberIds = mockData.slice(40, 50);
    jest.spyOn(vm, 'memberIds', 'get').mockReturnValue(thirdPageMemberIds);
    expect(vm.memberIds).toMatchObject(thirdPageMemberIds);
  });
});
