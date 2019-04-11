/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-09-28 17:23:20
 * Copyright © RingCentral. All rights reserved.
 */
import { action, computed } from 'mobx';
import { AccountService } from 'sdk/module/account';

import { AbstractViewModel } from '@/base';
import storeManager from '@/store';
import { getGlobalValue } from '@/store/utils';
import { GLOBAL_KEYS } from '@/store/constants';
import { ServiceConfig, ServiceLoader } from 'sdk/module/serviceLoader';
const globalStore = storeManager.getGlobalStore();

class TopBarViewModel extends AbstractViewModel {
  brandName: string = 'RingCentral';

  @action
  updateLeftNavState = () => {
    const isLeftNavOpen = !globalStore.get(GLOBAL_KEYS.IS_LEFT_NAV_OPEN);
    globalStore.set(GLOBAL_KEYS.IS_LEFT_NAV_OPEN, isLeftNavOpen);
  }

  @computed
  get currentUserId() {
    return getGlobalValue(GLOBAL_KEYS.CURRENT_USER_ID);
  }

  @action
  signOut = () => {
    const accountService = ServiceLoader.getInstance<AccountService>(
      ServiceConfig.ACCOUNT_SERVICE,
    );
    accountService.logout();
    window.location.href = '/';
  }
}

export { TopBarViewModel };
