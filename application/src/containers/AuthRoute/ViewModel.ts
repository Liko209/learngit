/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-09-10 09:36:06
 * Copyright © RingCentral. All rights reserved.
 */

import { service } from 'sdk';
import storeManager from '@/store';
import { computed, observable, action } from 'mobx';
import * as H from 'history';
import { parse } from 'qs';

class ViewModel {
  private _authService: service.AuthService;
  @observable
  open: boolean;

  constructor() {
    this._authService = service.AuthService.getInstance();
  }

  isAuthenticated() {
    return this._authService.isLoggedIn();
  }

  @action.bound
  setOpen(open: boolean) {
    this.open = open;
  }

  @computed
  get offline() {
    const globalStore = storeManager.getGlobalStore();
    return globalStore.get('network') === 'offline';
  }

  async unifiedLogin(location: H.Location, history: H.History) {
    try {
      const { state = '/', code, id_token: token } = this.getUrlParams(
        location,
      );
      if (code || token) {
        await this._authService.unifiedLogin({ code, token });
      }
      this.redirect(history, state);
    } catch (e) {
      this.setOpen(true);
    }
  }

  onClose(location: H.Location, history: H.History) {
    const { state = '/' } = this.getUrlParams(location);
    this.redirect(history, state);
  }

  getUrlParams(location: H.Location) {
    return parse(location.search, { ignoreQueryPrefix: true });
  }

  redirect(history: H.History, state: string) {
    history.replace(state.replace('$', '&'));
  }
}

export default ViewModel;
