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
import { GLOBAL_KEYS } from '@/store/constants';
import { StoreViewModel } from '@/store/ViewModel';
import history from '@/history';
import { ProfileService } from 'sdk/module/profile';

const { SERVICE } = service;

class TokenRouteViewModel extends StoreViewModel {
  private _authService: AuthService = AuthService.getInstance();
  @observable isError: boolean = false;

  constructor() {
    super();
    this.subscribeNotificationOnce(
      SERVICE.FETCH_INDEX_DATA_DONE,
      this.handleHasLoggedIn,
    );
  }

  @action
  private _setIsError(open: boolean) {
    this.isError = open;
  }

  @computed
  get isOffline() {
    return getGlobalValue(GLOBAL_KEYS.NETWORK) === 'offline';
  }

  @action.bound
  async handleHasLoggedIn() {
    const profileService: ProfileService = ProfileService.getInstance();
    const { location } = history;
    const { state = '/' } = this._getUrlParams(location);
    await profileService.markMeConversationAsFav();
    this._redirect(state);
  }

  unifiedLogin = async () => {
    try {
      const { location } = history;
      const { code, id_token: token } = this._getUrlParams(location);
      if (code || token) {
        await this._authService.unifiedLogin({ code, token });
      }
    } catch (e) {
      this._setIsError(true);
    }
  }

  redirectToIndex = async () => {
    const authService = AuthService.getInstance() as AuthService;
    await authService.logout();
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
