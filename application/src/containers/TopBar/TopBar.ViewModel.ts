/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-09-28 17:23:20
 * Copyright © RingCentral. All rights reserved.
 */
import { action, computed } from 'mobx';
import { AuthService } from 'sdk/service';

import { AbstractViewModel } from '@/base';
import storeManager from '@/store';
import { getGlobalValue } from '@/store/utils';
import { GLOBAL_KEYS } from '@/store/constants';

class TopBarViewModel extends AbstractViewModel {
  brandName: string = 'RingCentral';
  @action
  updateLeftNavState = () => {
    const globalStore = storeManager.getGlobalStore();
    const isLeftNavOpen = !globalStore.get(GLOBAL_KEYS.IS_LEFT_NAV_OPEN);
    globalStore.set(GLOBAL_KEYS.IS_LEFT_NAV_OPEN, isLeftNavOpen);
  }

  @action
  updateCreateTeamDialogState = () => {
    console.log('open,-------------');
    const globalStore = storeManager.getGlobalStore();
    const isShowCreateTeamDialog = !globalStore.get(
      GLOBAL_KEYS.IS_SHOW_CREATE_TEAM_DIALOG,
    );
    globalStore.set(
      GLOBAL_KEYS.IS_SHOW_CREATE_TEAM_DIALOG,
      isShowCreateTeamDialog,
    );
  }

  @computed
  get currentUserId() {
    return getGlobalValue(GLOBAL_KEYS.CURRENT_USER_ID);
  }

  @action
  signOut = () => {
    const authService: AuthService = AuthService.getInstance();
    authService.logout();
    window.location.href = '/';
  }
}

export { TopBarViewModel };
