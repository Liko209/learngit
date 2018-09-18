/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-08-30 11:21:18
 * Copyright © RingCentral. All rights reserved.
 */
import { action, computed } from 'mobx';

import BaseNotificationSubscribable from '@/store/base/BaseNotificationSubscribable';
import { getGlobalValue } from '@/store/utils';

import config from '@/config';

import { service } from 'sdk';
import betaUsers from '@/config/whitelist.json';

const { AccountService, AuthService, SERVICE } = service;
const APP_NAME = 'RingCentral';

export default class HomePresenter extends BaseNotificationSubscribable {
  private userId: number | null;
  constructor() {
    super();

    this.subscribeNotificationOnce(SERVICE.FETCH_INDEX_DATA_DONE, () =>
      this.handleHasLogin(),
    );
  }

  @action
  handleHasLogin() {
    const accountService: service.AccountService = AccountService.getInstance();
    const env = config.getEnv() || 'XMN-Stable';
    this.userId = accountService.getCurrentUserId();

    if (
      env === 'production' &&
      !betaUsers.betaUserIdList.some(
        (username: string) => String(this.userId).indexOf(username) > -1,
      )
    ) {
      alert('Invalid account');
      this.handleSignOutClick();
      return;
    }
  }

  @action
  public async handleSignOutClick() {
    const authService: service.AuthService = AuthService.getInstance();
    return authService.logout();
  }

  @computed
  get title() {
    const appUmi = getGlobalValue('UMI.app');
    console.log('UMI.app', appUmi);
    if (appUmi) {
      return `(${appUmi}) ${APP_NAME}`;
    }
    return APP_NAME;
  }
}
