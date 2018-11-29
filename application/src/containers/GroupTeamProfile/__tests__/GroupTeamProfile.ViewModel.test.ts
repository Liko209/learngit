/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-11-21 15:09:02
 * Copyright © RingCentral. All rights reserved.
 */
import { GroupTeamProfileViewModel } from '../GroupTeamProfile.ViewModel';
import { TypeDictionary } from 'sdk/utils';

jest.mock('../../../store/utils');
const groupId = 15417346;
const groupTeamProfileVM = new GroupTeamProfileViewModel({ id: groupId });

describe('GroupTeamProfileViewModel', () => {
  it('should return group id if group id provided', () => {
    new GroupTeamProfileViewModel({ id: groupId });
    expect(groupTeamProfileVM.id).toBe(groupId);
  });
  it('should return group type if group id provided', () => {
    expect(groupTeamProfileVM.type).toBe(TypeDictionary.TYPE_ID_GROUP);
  });
});
