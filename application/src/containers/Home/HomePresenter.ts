/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-08-30 11:21:18
 * Copyright © RingCentral. All rights reserved.
 */
import { observable, action } from 'mobx';

import BasePresenter from '@/store/base/BasePresenter';

import config from '@/config';

import { service } from 'sdk';
import betaUsers from '@/config/whitelist.json';

const { AccountService, AuthService, SERVICE } = service;

export default class HomePresenter extends BasePresenter {
  @observable loading = false;
  @observable error = {};
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
      !betaUsers.betaUserIdList.some((username: string) => String(this.userId).indexOf(username) > -1)
    ) {
      alert('Invalid account');
      this.signOutClickHandler();
      return;
    }
    this.loading = false;
  }

  @action
  public async signOutClickHandler() {
    const authService: service.AuthService = AuthService.getInstance();
    await authService.logout();
    window.location.href = '/';
  }
}
