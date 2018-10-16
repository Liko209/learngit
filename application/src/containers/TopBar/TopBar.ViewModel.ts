/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-09-28 17:23:20
 * Copyright © RingCentral. All rights reserved.
 */

import { action, computed, observable } from 'mobx';
import { AuthService } from 'sdk/service';

import { AbstractViewModel } from '@/base';
import storeManager from '@/store';
import { getGlobalValue } from '@/store/utils';

class TopBarViewModel extends AbstractViewModel {
  brandName: string = 'RingCentral';
  @observable
  isShowDialog: boolean = false;
  @action
  updateLeftNavState = () => {
    const globalStore = storeManager.getGlobalStore();
    const isLeftNavOpen = !globalStore.get('isLeftNavOpen');
    globalStore.set('isLeftNavOpen', isLeftNavOpen);
  }

  @action
  updateCreateTeamDialogState = () => {
    console.log('open,-------------');
    const globalStore = storeManager.getGlobalStore();
    const isShowCreateTeamDialog = !globalStore.get('isShowCreateTeamDialog');
    globalStore.set('isShowCreateTeamDialog', isShowCreateTeamDialog);
  }

  @computed
  get currentUserId() {
    return getGlobalValue('currentUserId');
  }

  @action
  signOut = () => {
    const authService: AuthService = AuthService.getInstance();
    authService.logout();
    window.location.href = '/';
  }
  @action
  handleAboutPage = () => {
    this.isShowDialog = !this.isShowDialog;
  }
  @computed
  get dialogStatus() {
    console.log('this.isShowDialog');
    return this.isShowDialog;
  }
}

export { TopBarViewModel };
