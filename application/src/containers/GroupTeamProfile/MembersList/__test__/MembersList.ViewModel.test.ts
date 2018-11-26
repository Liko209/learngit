/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-11-26 17:29:02
 * Copyright © RingCentral. All rights reserved.
 */
import SortableGroupMemberHandler from '@/store/handler/SortableGroupMemberHandler';
import { MembersListViewModel } from '../MembersList.ViewModel';
import { getEntity } from '@/store/utils';
jest.mock('../../../../store/utils');
jest.mock('../../../../store/handler/SortableGroupMemberHandler');

const membersListVM = new MembersListViewModel();
const group = {
  id: 123, members: [1, 2, 3], ompany_id: 22333,
  set_abbreviation: 'ddd',
  email_friendly_abbreviation: 'ddd',
  most_recent_content_modified_at: 23,
  created_at: 23,
  modified_at: 234,
  creator_id: 333,
  is_new: true,
  deactivated: false,
  version: 123,
  company_id: 12,
};
const MemberListHandler : SortableGroupMemberHandler = new SortableGroupMemberHandler(group);
describe('MembersListViewModel', () => {
  // it('isThePersonGuest', () => {
  //
  // }
  it('should return isThePersonGuest if get members id', async() => {
    SortableGroupMemberHandler.createSortableGroupMemberHandler = jest.fn().mockResolvedValue(MemberListHandler);
    MemberListHandler.getSortedGroupMembersIds = jest.fn().mockReturnValue([1, 2, 3]);
    MemberListHandler && MemberListHandler.getSortedGroupMembersIds();
    expect(membersListVM.isThePersonGuest).toMatchObject([true, false]);
  });
  it('membersList', () => {
    (getEntity as jest.Mock).mockReturnValue({ members: [123, 345, 677, 90023] });

  });
});
