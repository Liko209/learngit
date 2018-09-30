/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-09-28 17:23:20
 * Copyright © RingCentral. All rights reserved.
 */

import { action } from 'mobx';
import { AuthService } from 'sdk/service';

import storeManager from '@/store';

class TopBarViewModel {
  brandName: string = 'RingCentral';

  @action
  updateLeftNavState() {
    const globalStore = storeManager.getGlobalStore();
    const isLeftNavOpen = !globalStore.get('isLeftNavOpen');
    globalStore.set('isLeftNavOpen', isLeftNavOpen);
  }

  @action
  updateCreateTeamDialogState() {
    const globalStore = storeManager.getGlobalStore();
    const isShowCreateTeamDialog = !globalStore.get('isShowCreateTeamDialog');
    globalStore.set('isShowCreateTeamDialog', isShowCreateTeamDialog);
  }

  signOut() {
    const authService: AuthService = AuthService.getInstance();
    authService.logout();
    window.location.href = '/';
  }
}

export { TopBarViewModel };
