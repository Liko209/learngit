/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-09-10 09:36:06
 * Copyright © RingCentral. All rights reserved.
 */

import { AuthService } from 'sdk/service';
import { getGlobalValue } from '@/store/utils';
import { computed, observable, action } from 'mobx';
import * as H from 'history';
import { parse } from 'qs';

class TokenRouteViewModel {
  private _authService: AuthService = AuthService.getInstance();
  @observable
  isOpen: boolean = false;

  @action.bound
  private _setOpen(open: boolean) {
    this.isOpen = open;
  }

  @computed
  get isOffline() {
    return getGlobalValue('network') === 'offline';
  }

  async unifiedLogin(location: H.Location, history: H.History) {
    try {
      const { state = '/', code, id_token: token } = this._getUrlParams(
        location,
      );
      if (code || token) {
        await this._authService.unifiedLogin({ code, token });
      }
      this._redirect(history, state);
    } catch (e) {
      this._setOpen(true);
    }
  }

  redirectToIndex(location: H.Location, history: H.History) {
    const { state = '/' } = this._getUrlParams(location);
    this._redirect(history, state);
  }

  private _getUrlParams(location: H.Location) {
    return parse(location.search, { ignoreQueryPrefix: true });
  }

  private _redirect(history: H.History, state: string) {
    history.replace(state.replace('$', '&'));
  }
}

export { TokenRouteViewModel };
