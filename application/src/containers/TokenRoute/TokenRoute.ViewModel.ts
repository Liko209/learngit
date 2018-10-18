/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-09-10 09:36:06
 * Copyright © RingCentral. All rights reserved.
 */

import { AuthService } from 'sdk/service';
import { computed, observable, action } from 'mobx';
import * as H from 'history';
import { parse } from 'qs';
import { service } from 'sdk';
import { getGlobalValue } from '@/store/utils';
import { StoreViewModel } from '@/store/ViewModel';
import history from '@/utils/history';

const { SERVICE, ProfileService } = service;

class TokenRouteViewModel extends StoreViewModel {
  private _authService: AuthService = AuthService.getInstance();
  @observable
  isOpen: boolean = false;

  constructor() {
    super();
    this.subscribeNotificationOnce(
      SERVICE.FETCH_INDEX_DATA_DONE,
      this.handleHasLoggedIn,
    );
  }

  @action
  private _setOpen(open: boolean) {
    this.isOpen = open;
  }

  @computed
  get isOffline() {
    return getGlobalValue('network') === 'offline';
  }

  @action.bound
  async handleHasLoggedIn() {
    const profileService: service.ProfileService = ProfileService.getInstance();
    const { location } = history;
    const { state = '/' } = this._getUrlParams(location);
    await profileService.markMeConversationAsFav();
    this._redirect(state);
  }

  unifiedLogin = () => {
    try {
      const { location } = history;
      const { code, id_token: token } = this._getUrlParams(location);
      if (code || token) {
        this._authService.unifiedLogin({ code, token });
      }
    } catch (e) {
      this._setOpen(true);
    }
  }

  redirectToIndex = () => {
    const { location } = history;
    const { state = '/' } = this._getUrlParams(location);
    this._redirect(state);
  }

  private _getUrlParams(location: H.Location) {
    return parse(location.search, { ignoreQueryPrefix: true });
  }

  private _redirect(state: string) {
    history.replace(state.replace('$', '&'));
  }
}

export { TokenRouteViewModel };
