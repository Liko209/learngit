/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-09-10 09:36:06
 * Copyright © RingCentral. All rights reserved.
 */

import { AccountService } from 'sdk/module/account';
import { computed, observable, action } from 'mobx';
import * as H from 'history';
import { parse } from 'qs';
import { mainLogger } from 'foundation/log';
import { getGlobalValue } from '@/store/utils';
import { GLOBAL_KEYS } from '@/store/constants';
import { StoreViewModel } from '@/store/ViewModel';
import history from '@/history';
import { ProfileService } from 'sdk/module/profile';
import { ServiceConfig, ServiceLoader } from 'sdk/module/serviceLoader';
import { SERVICE } from 'sdk/service';
import { LoginInfo } from 'sdk/types';

class TokenRouteViewModel extends StoreViewModel {
  private _LoggedInHandled: boolean = false;
  @observable isError: boolean = false;

  constructor() {
    super();
    this.subscribeNotification(
      SERVICE.RC_LOGIN,
      this.handleHasLoggedIn.bind(this),
    );
    this.subscribeNotification(SERVICE.GLIP_LOGIN, async (loginInfo: LoginInfo) => {
      loginInfo.success && (await this.handleHasLoggedIn());
    });
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
    if (this._LoggedInHandled) {
      return;
    }
    this._LoggedInHandled = true;
    const profileService = ServiceLoader.getInstance<ProfileService>(
      ServiceConfig.PROFILE_SERVICE,
    );
    const { location } = history;
    const { state = '/' } = this._getUrlParams(location);

    await profileService.markMeConversationAsFav().catch((error: Error) => {
      this._LoggedInHandled = false;
      mainLogger
        .tags('TokenRoute.ViewModel')
        .info('markMeConversationAsFav fail:', error);
    });
    this._redirect(state);
  }

  unifiedLogin = async () => {
    try {
      const { location } = history;
      const { code, id_token, t } = this._getUrlParams(location);
      const token = t || id_token;
      if (code || token) {
        const accountService = ServiceLoader.getInstance<AccountService>(
          ServiceConfig.ACCOUNT_SERVICE,
        );
        await accountService.unifiedLogin({ code, token });
      }
    } catch (e) {
      this._setIsError(true);
    }
  };

  redirectToIndex = async () => {
    const accountService = ServiceLoader.getInstance<AccountService>(
      ServiceConfig.ACCOUNT_SERVICE,
    );
    await accountService.logout();
    const { location } = history;
    const { state = '/' } = this._getUrlParams(location);
    this._redirect(state);
  };

  private _getUrlParams(location: H.Location) {
    return parse(location.search, { ignoreQueryPrefix: true });
  }

  private _redirect(state: string) {
    history.replace(state.replace('$', '&'));
  }
}

export { TokenRouteViewModel };
