/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-11-21 15:09:02
 * Copyright © RingCentral. All rights reserved.
 */
import { GLOBAL_KEYS } from '@/store/constants';
import storeManager from '@/store';
const globalStore = storeManager.getGlobalStore();
import { GroupTeamProfileViewModel } from '../GroupTeamProfile.ViewModel';

jest.mock('../../../store/utils');
const groupTeamProfileVM = new GroupTeamProfileViewModel();
describe('GroupTeamProfileViewModel', () => {
  beforeAll(() => {
    jest.resetAllMocks();
  });
  it('should return group id if group id provided', () => {
    globalStore.set(GLOBAL_KEYS.GROUP_OR_TEAM_ID, 1234);
    expect(groupTeamProfileVM.id).toBe(1234);
  });
});
