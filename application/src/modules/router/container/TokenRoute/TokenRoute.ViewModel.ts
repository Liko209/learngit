/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-09-10 09:36:06
 * Copyright © RingCentral. All rights reserved.
 */

import { AuthService } from 'sdk/service';
import { computed, observable, action } from 'mobx';
import * as H from 'history';
import { parse } from 'qs';
import { service, mainLogger } from 'sdk';
import { getGlobalValue } from '@/store/utils';
import { GLOBAL_KEYS } from '@/store/constants';
import { StoreViewModel } from '@/store/ViewModel';
import history from '@/history';
import { ProfileService } from 'sdk/module/profile';

const { SERVICE } = service;

class TokenRouteViewModel extends StoreViewModel {
  private _authService: AuthService = AuthService.getInstance();
  private _LoggedInHandled: boolean = false;
  @observable isError: boolean = false;

  constructor() {
    super();
    this.subscribeNotification(
      SERVICE.LOGIN,
      this.handleHasLoggedIn.bind(this),
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
  async handleHasLoggedIn(isRCOnlyMode: boolean) {
    if (this._LoggedInHandled) {
      return;
    }
    const profileService: ProfileService = ProfileService.getInstance();
    const { location } = history;
    const { state = '/' } = this._getUrlParams(location);

    await profileService.markMeConversationAsFav().catch((error: Error) => {
      mainLogger
        .tags('TokenRoute.ViewModel')
        .info('markMeConversationAsFav fail:', error);
    });
    this._redirect(state);
    this._LoggedInHandled = true;
  }

  unifiedLogin = async () => {
    try {
      const { location } = history;
      const { code, id_token, t } = this._getUrlParams(location);
      const token = t || id_token;
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
