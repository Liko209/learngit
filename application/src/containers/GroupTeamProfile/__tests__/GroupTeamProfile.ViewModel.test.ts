/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-11-21 15:09:02
 * Copyright © RingCentral. All rights reserved.
 */
import { GroupTeamProfileViewModel } from '../GroupTeamProfile.ViewModel';
import { TypeDictionary } from 'sdk/utils';

jest.mock('../../../store/utils');
const GROUP_ID = 15417346;
const groupTeamProfileVM = new GroupTeamProfileViewModel();
const TEAM_ID = 8839174;
describe('GroupTeamProfileViewModel', () => {
  it('should computed group id if group id changed', () => {
    groupTeamProfileVM.props.id = GROUP_ID;
    expect(groupTeamProfileVM.id).toBe(GROUP_ID);
    groupTeamProfileVM.props.id = TEAM_ID;
    expect(groupTeamProfileVM.id).toBe(TEAM_ID);
  });
  it('should computed group type if group id changed', () => {
    groupTeamProfileVM.props.id = GROUP_ID;
    expect(groupTeamProfileVM.type).toBe(TypeDictionary.TYPE_ID_GROUP);
    groupTeamProfileVM.props.id = TEAM_ID;
    expect(groupTeamProfileVM.type).toBe(TypeDictionary.TYPE_ID_TEAM);
  });
});
