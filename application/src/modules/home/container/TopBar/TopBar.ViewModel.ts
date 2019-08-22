/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-09-28 17:23:20
 * Copyright © RingCentral. All rights reserved.
 */
import { container } from 'framework/ioc';
import { action, computed } from 'mobx';
import { AccountService } from 'sdk/module/account';

import { AbstractViewModel } from '@/base';
import { analyticsCollector } from '@/AnalyticsCollector';
import storeManager from '@/store/base/StoreManager';
import { getGlobalValue } from '@/store/utils';
import { GLOBAL_KEYS } from '@/store/constants';
import { GlobalSearchService } from '@/modules/GlobalSearch/service';
import { GlobalSearchStore } from '@/modules/GlobalSearch/store';

import { ServiceConfig, ServiceLoader } from 'sdk/module/serviceLoader';

const globalStore = storeManager.getGlobalStore();

class TopBarViewModel extends AbstractViewModel {
  private _globalSearchService: GlobalSearchService = container.get(
    GlobalSearchService,
  );
  private _globalSearchStore: GlobalSearchStore = container.get(
    GlobalSearchStore,
  );

  brandName: string = 'RingCentral';

  @action
  updateLeftNavState = () => {
    const isLeftNavOpen = !globalStore.get(GLOBAL_KEYS.IS_LEFT_NAV_OPEN);
    globalStore.set(GLOBAL_KEYS.IS_LEFT_NAV_OPEN, isLeftNavOpen);

    analyticsCollector.toggleLeftNavPanel(isLeftNavOpen);
  };

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
  };

  @action
  openGlobalSearch = () => {
    this._globalSearchService.openGlobalSearch();
  };

  @computed
  get searchKey() {
    return this._globalSearchStore.searchKey;
  }

  @action
  onClear = () => {
    this._globalSearchStore.clearSearchKey();
  };
}

export { TopBarViewModel };
