/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-11-21 15:09:02
 * Copyright © RingCentral. All rights reserved.
 */
import { GroupTeamProfileViewModel } from '../GroupTeamProfile.ViewModel';
import { CONVERSATION_TYPES } from '@/constants';
import { getEntity } from '@/store/utils';

jest.mock('../../../store/utils');
const groupId = 12345;
const groupTeamProfileVM = new GroupTeamProfileViewModel({ id: groupId });

function mockReturnGroupType(type: CONVERSATION_TYPES) {
  return (getEntity as jest.Mock) = jest.fn().mockReturnValue({
    type,
  });
}
describe('GroupTeamProfileViewModel', () => {
  it('should return group id if group id provided', () => {
    new GroupTeamProfileViewModel({ id: groupId });
    expect(groupTeamProfileVM.id).toBe(groupId);
  });
  it('should return group type if group id provided', () => {
    mockReturnGroupType(CONVERSATION_TYPES.NORMAL_GROUP);
    expect(groupTeamProfileVM.type).toBe(CONVERSATION_TYPES.NORMAL_GROUP);
  });
});
