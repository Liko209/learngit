/*
 * @Author: Andy Hu
 * @Date: 2018-10-11 19:12:17
 * Copyright © RingCentral. All rights reserved.
 */
import { action, observable } from 'mobx';

import { StoreViewModel } from '@/store/ViewModel';
import { service } from 'sdk';
import { ProfileService as IProfileService } from 'sdk/src/service';

const { SERVICE, ProfileService } = service;

class HomeViewModel extends StoreViewModel {
  constructor() {
    super();
    this.subscribeNotificationOnce(
      SERVICE.FETCH_INDEX_DATA_DONE,
      this.handleHasLoggedIn,
    );
  }

  @observable
  openCreateTeam: boolean = false;
  @observable
  invalidUser: boolean = false;

  validateGroupId(groupId: number) {}

  @action.bound
  async handleHasLoggedIn() {
    const profileService: IProfileService = ProfileService.getInstance();
    profileService.markMeConversationAsFav();
  }

  @action
  public toggleCreateTeam() {
    this.openCreateTeam = !this.openCreateTeam;
  }
}
export { HomeViewModel };
