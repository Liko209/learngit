/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-11-26 17:29:02
 * Copyright © RingCentral. All rights reserved.
 */
import { getEntity } from '../../../../store/utils';
import { MembersListViewModel } from '../MembersList.ViewModel';
jest.mock('../../../../store/utils');
jest.mock('../../../../store/handler/SortableGroupMemberHandler');

const membersListVM = new MembersListViewModel();
const group = {
  id: 123,
  members: [1, 2, 3],
};
describe('MembersListViewModel', () => {
  it('should return isThePersonGuest if get members id', () => {
    (getEntity as jest.Mock) = jest.fn().mockReturnValue({
      isThePersonGuest: jest.fn(() => {
        return true;
      }),
    });
    jest.spyOn<MembersListViewModel, any>(membersListVM, '_paginationMemberIds', 'get').mockReturnValue([1, 2, 3]);

    // expect(membersListVM.isThePersonGuests).toMatchObject([true, true, true]);
  });
  it('should get pagination data while scroll to bottom', () => {
    const memberIds = [];
    for (let i = 0; i < 100; i++) {
      memberIds[i] = i;
    }
    jest.spyOn<MembersListViewModel, any>(membersListVM, '_paginationMemberIds', 'get').mockReturnValue(memberIds);
    (getEntity as jest.Mock).mockReturnValue(group);
    membersListVM.toBottom();
    // membersListVM.toBottom();
    // membersListVM.toBottom();
    const groupObjects = [];
    for (let k = 0; k < 40; k++) {
      groupObjects.push(group);
    }
    // expect(membersListVM.membersList.length).toBe(40);
  });
});
