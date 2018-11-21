/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-11-21 15:09:02
 * Copyright © RingCentral. All rights reserved.
 */
// import { getEntity } from '../../../store/utils';
import { GroupTeamProfileViewModel } from '../GroupTeamProfile.ViewModel';
// import { ENTITY_NAME } from '../../../store';
import { GLOBAL_KEYS } from '../../..//store/constants';
import storeManager from '@/store';
const globalStore = storeManager.getGlobalStore();

jest.mock('../../../store/utils');

const groupTeamProfileVM = new GroupTeamProfileViewModel();
describe('GroupTeamProfileViewModel', () => {
  beforeAll(() => {
    jest.resetAllMocks();
  });

  it('isShowGroupTeamProfileDialog should return false while GLOBAL_KEYS return false',  () => {
    globalStore.set(GLOBAL_KEYS.IS_SHOW_GROUP_PROFILE, true);
    expect(groupTeamProfileVM.isShowGroupTeamProfileDialog).toBe(true);
  });
});
