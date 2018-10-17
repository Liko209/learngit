/*
 * @Author: Andy Hu
 * @Date: 2018-10-11 19:12:17
 * Copyright © RingCentral. All rights reserved.
 */
import { Location, Action } from 'history';
import { action, observable } from 'mobx';
import { service } from 'sdk';
import { ProfileService as IProfileService } from 'sdk/src/service';

import { StoreViewModel } from '@/store/ViewModel';
import history from '@/utils/history';
import historyStack from '@/utils/HistoryStack';

const { SERVICE, ProfileService } = service;

class HomeViewModel extends StoreViewModel {
  @observable
  indexLoaded: boolean = false;

  constructor() {
    super();
    this._initHistoryListen();
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
    await profileService.markMeConversationAsFav();
    this.indexLoaded = true;
  }

  @action
  public toggleCreateTeam() {
    this.openCreateTeam = !this.openCreateTeam;
  }

  private _initHistoryListen() {
    history.listen((location: Location, action: Action) => {
      const { state, pathname } = location;
      if (state && state.navByBackNForward) {
        return;
      }
      if (historyStack.getCurrentPathname() === pathname) {
        return;
      }
      if (action === 'PUSH') {
        historyStack.push(pathname);
      }
      if (action === 'REPLACE') {
        historyStack.replace(pathname);
      }
    });
  }
}
export { HomeViewModel };
