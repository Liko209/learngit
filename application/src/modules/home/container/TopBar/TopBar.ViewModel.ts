/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-09-28 17:23:20
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { action, computed, observable } from 'mobx';
import { AuthService } from 'sdk/service';

import { AbstractViewModel } from '@/base';
import storeManager from '@/store';
import { getGlobalValue } from '@/store/utils';
import { GLOBAL_KEYS } from '@/store/constants';
const globalStore = storeManager.getGlobalStore();

class TopBarViewModel extends AbstractViewModel {
  brandName: string = 'RingCentral';
  @observable
  private _isShowDialog: boolean = false;
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
  handleAboutPage = (
    event: React.MouseEvent<HTMLElement>,
    appVersion?: string,
    electronVersion?: string,
  ) => {
    globalStore.set(GLOBAL_KEYS.APP_VERSION, appVersion || '');
    globalStore.set(GLOBAL_KEYS.ELECTRON_VERSION, electronVersion || '');
    globalStore.set(GLOBAL_KEYS.IS_SHOW_ABOUT_DIALOG, !this._isShowDialog);
  }
}

export { TopBarViewModel };
