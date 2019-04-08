/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-09-28 17:23:20
 * Copyright © RingCentral. All rights reserved.
 */
import { container } from 'framework';
import { action, computed } from 'mobx';
import { AuthService } from 'sdk/service';

import { AbstractViewModel } from '@/base';
import storeManager from '@/store';
import { getGlobalValue } from '@/store/utils';
import { GLOBAL_KEYS } from '@/store/constants';
import { GlobalSearchService } from '@/modules/GlobalSearch/service';

const globalStore = storeManager.getGlobalStore();

class TopBarViewModel extends AbstractViewModel {
  private _globalSearchService: GlobalSearchService = container.get(
    GlobalSearchService,
  );

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
    const authService: AuthService = AuthService.getInstance();
    authService.logout();
    window.location.href = '/';
  }

  @action
  openGlobalSearch = () => {
    this._globalSearchService.openGlobalSearch();
  }
}

export { TopBarViewModel };
