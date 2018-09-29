/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-08-30 11:21:18
 * Copyright © RingCentral. All rights reserved.
 */
import { action, observable } from 'mobx';

import BaseNotificationSubscribable from '@/store/base/BaseNotificationSubscribable';
import config from '@/config';

import { service } from 'sdk';
import betaUsers from '@/config/whitelist.json';
import { ProfileService as IProfileService } from 'sdk/src/service';

const { AccountService, AuthService, SERVICE, ProfileService } = service;

export default class HomePresenter extends BaseNotificationSubscribable {
  private userId: number | null;
  @observable
  openCreateTeam: boolean;

  constructor() {
    super();

    this.subscribeNotificationOnce(SERVICE.FETCH_INDEX_DATA_DONE, () =>
      this.handleHasLogin(),
    );
    this.openCreateTeam = false;
  }

  @action
  handleHasLogin() {
    const accountService: service.AccountService = AccountService.getInstance();
    const env = config.getEnv() || 'XMN-Stable';
    this.userId = accountService.getCurrentUserId();
    ProfileService.getInstance<IProfileService>().markMeConversationAsFav();
    if (
      env === 'jupiter' &&
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
    await authService.logout();
    if (window.jupiterElectron && window.jupiterElectron.setBadgeCount) {
      window.jupiterElectron.setBadgeCount(0);
    }
    sessionStorage.removeItem('backNavArray');
    sessionStorage.removeItem('forwardNavArray');
    window.location.href = '/';
  }

  @action
  public handleOpenCreateTeam() {
    this.openCreateTeam = !this.openCreateTeam;
  }
}
