/*
 * @Author: Andy Hu
 * @Date: 2018-10-11 19:12:17
 * Copyright © RingCentral. All rights reserved.
 */
import { action, observable } from 'mobx';

import config from '@/config';
import { StoreViewModel } from '@/store/ViewModel';
import { service } from 'sdk';
import betaUsers from '@/config/whitelist.json';
import { ProfileService as IProfileService } from 'sdk/src/service';

const { AccountService, AuthService, SERVICE, ProfileService } = service;

class HomeViewModel extends StoreViewModel {
  private userId: number | null;
  @observable
  openCreateTeam: boolean = false;
  @observable
  invalidUser: boolean = false;

  constructor() {
    super();
    this.subscribeNotificationOnce(
      SERVICE.FETCH_INDEX_DATA_DONE,
      this.handleHasLoggedIn,
    );
  }

  @action.bound
  handleHasLoggedIn() {
    const accountService: service.AccountService = AccountService.getInstance();
    this.userId = accountService.getCurrentUserId();
    ProfileService.getInstance<IProfileService>().markMeConversationAsFav();
    this.checkInvalidUser();
  }

  checkInvalidUser() {
    const env = config.getEnv();
    if (
      env === 'jupiter' &&
      !betaUsers.betaUserIdList.some(
        (username: string) => String(this.userId).indexOf(username) > -1,
      )
    ) {
      this.invalidUser = true;
      this.signOut();
    }
  }

  public async signOut() {
    const authService: service.AuthService = AuthService.getInstance();
    await authService.logout();
  }

  @action
  public toggleCreateTeam() {
    this.openCreateTeam = !this.openCreateTeam;
  }
}
export { HomeViewModel };
