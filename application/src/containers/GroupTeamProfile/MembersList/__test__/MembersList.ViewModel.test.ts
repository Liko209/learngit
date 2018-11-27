/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-11-26 17:29:02
 * Copyright © RingCentral. All rights reserved.
 */
import { MembersListViewModel } from '../MembersList.ViewModel';
jest.mock('../../../../store/utils');
jest.mock('../../../../store/handler/SortableGroupMemberHandler');

const membersListVM = new MembersListViewModel();

const memberIds: number[] = [];
for (let i = 0; i < 100; i++) {
  memberIds[i] = i;
}
const twentyItems: number[] = [];
for (let i = 0; i < 20; i++) {
  twentyItems[i] = i;
}

describe('MembersListViewModel', () => {
  it('should return memberIds if get group id', () => {
    jest.spyOn<MembersListViewModel, any>(membersListVM, 'memberIds', 'get').mockReturnValue(twentyItems);

    expect(membersListVM.memberIds).toMatchObject(twentyItems);
  });
});
