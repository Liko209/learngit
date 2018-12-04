/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-12-3 14:29:02
 * Copyright © RingCentral. All rights reserved.
 */
import { GroupTeamMembersViewModel } from '../GroupTeamMembers.ViewModel';
jest.mock('../../../store/handler/SortableGroupMemberHandler');

const groupMembers = new GroupTeamMembersViewModel();

const getMemberIdsByNum = (num: number) => {
  const memberIds: number[] = [];
  for (let i = 0; i < num; i++) {
    memberIds[i] = i;
  }
  return memberIds;
};
describe('GroupTeamMembersViewModel', () => {
  it('should computed allMemberIds if allMemberIds changed', async () => {
    jest.spyOn<GroupTeamMembersViewModel, any>(groupMembers, 'allMemberIds', 'get').mockReturnValue(getMemberIdsByNum(10));
    expect(groupMembers.allMemberIds).toEqual(getMemberIdsByNum(10));
    jest.spyOn<GroupTeamMembersViewModel, any>(groupMembers, 'allMemberIds', 'get').mockReturnValue(getMemberIdsByNum(20));
    expect(groupMembers.allMemberIds).toEqual(getMemberIdsByNum(20));
  });
});
