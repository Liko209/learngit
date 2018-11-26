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
  ompany_id: 22333,
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
describe('MembersListViewModel', () => {
  it('should return isThePersonGuest if get members id', () => {
    (getEntity as jest.Mock) = jest.fn().mockReturnValue({
      isThePersonGuest: jest.fn(() => {
        return true;
      }),
    });
    jest.spyOn<MembersListViewModel, any>(membersListVM, '_paginationMemberIds', 'get').mockReturnValue([1, 2, 3]);

    expect(membersListVM.isThePersonGuest).toMatchObject([true, true, true]);
  });
  it('should return membersList if group id is provided', () => {
    jest.spyOn<MembersListViewModel, any>(membersListVM, '_paginationMemberIds', 'get').mockReturnValue([1]);
    (getEntity as jest.Mock).mockReturnValue(group);
    expect(membersListVM.membersList).toMatchObject([group]);
  });
});
