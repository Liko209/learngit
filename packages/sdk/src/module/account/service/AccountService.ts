/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2019-04-03 14:01:19
 * Copyright © RingCentral. All rights reserved.
 */

import { mainLogger, DEFAULT_BEFORE_EXPIRED } from 'foundation';
import { PersonService } from '../../person';
import { Person } from '../../person/entity';
import { generateUUID } from '../../../utils/mathUtils';
import { IPlatformHandleDelegate, ITokenModel, RCAuthApi } from '../../../api';
import notificationCenter from '../../../service/notificationCenter';
import { SERVICE } from '../../../service/eventKey';
import { ProfileService } from '../../profile';
import { setRCToken } from '../../../authenticator/utils';
import { AccountGlobalConfig } from '../config';
import { AuthUserConfig } from '../config/AuthUserConfig';
import { AccountUserConfig } from '../config/AccountUserConfig';
import {
  AuthController,
  IUnifiedLogin,
  ILogin,
} from '../controller/AuthController';
import { AbstractService, AccountManager } from '../../../framework';
import { ServiceLoader, ServiceConfig } from '../../serviceLoader';
import { Nullable } from '../../../types';

const DEFAULT_UNREAD_TOGGLE_SETTING = false;
const LOG_TAG = 'AccountService';

class AccountService extends AbstractService
  implements IPlatformHandleDelegate {
  static serviceName = 'AccountService';
  static _instance: AccountService;

  private _refreshTokenQueue: ((token: ITokenModel | null) => void)[] = [];
  private _isRefreshingToken: boolean;
  private _authController: AuthController;
  private _userConfig: AccountUserConfig;
  private _authUserConfig: AuthUserConfig;

  constructor(private _accountManager: AccountManager) {
    super();
  }

  protected onStarted() {}
  protected onStopped() {}

  get userConfig() {
    if (!this._userConfig) {
      this._userConfig = new AccountUserConfig();
    }
    return this._userConfig;
  }

  get authUserConfig() {
    if (!this._authUserConfig) {
      this._authUserConfig = new AuthUserConfig();
    }
    return this._authUserConfig;
  }

  getAuthController() {
    if (!this._authController) {
      this._authController = new AuthController(this._accountManager);
    }
    return this._authController;
  }

  isAccountReady(): boolean {
    return this.userConfig.getGlipUserId() ? true : false;
  }

  async getCurrentUserInfo(): Promise<Nullable<Person>> {
    const personService = ServiceLoader.getInstance<PersonService>(
      ServiceConfig.PERSON_SERVICE,
    );
    if (!this.isAccountReady()) {
      return null;
    }
    const userId = this.userConfig.getGlipUserId();
    try {
      return await personService.getById(userId);
    } catch (error) {
      mainLogger.tags(LOG_TAG).debug('Get user info fail:', error);
    }
    return null;
  }

  async getUserEmail(): Promise<Nullable<string>> {
    const userInfo = await this.getCurrentUserInfo();
    return userInfo ? userInfo.email : null;
  }

  getClientId(): string {
    let id = this.userConfig.getClientId();
    if (id) {
      return id;
    }
    id = generateUUID();
    this.userConfig.setClientId(id);
    return id;
  }

  async refreshRCToken(): Promise<ITokenModel | null> {
    if (this._isRefreshingToken) {
      return new Promise<ITokenModel | null>(resolve => {
        this._refreshTokenQueue.push(resolve);
      });
    }

    this._isRefreshingToken = true;
    return new Promise<ITokenModel | null>(async resolve => {
      const result = await this._doRefreshRCToken();
      resolve(result);

      this._refreshTokenQueue.forEach(
        (value: (token: ITokenModel | null) => void) => {
          value(result);
        },
      );
      this._refreshTokenQueue = [];
      this._isRefreshingToken = false;
    });
  }

  private async _doRefreshRCToken(): Promise<ITokenModel | null> {
    try {
      const oldRcToken = this.authUserConfig.getRCToken();
      const newRcToken = (await RCAuthApi.refreshToken(
        oldRcToken,
      )) as ITokenModel;
      setRCToken(newRcToken);
      return newRcToken;
    } catch (error) {
      mainLogger.tags(LOG_TAG).warn('failed to refresh token', error);
      return null;
    }
  }

  async getRCToken() {
    let rcToken = this.authUserConfig.getRCToken();
    if (rcToken && this._isRCTokenExpired(rcToken)) {
      rcToken = await this.refreshRCToken();
    }

    return rcToken;
  }

  private _isRCTokenExpired(rcToken: ITokenModel) {
    const accessTokenExpireInMillisecond = rcToken.expires_in * 1000;
    const lastValidTime =
      rcToken.timestamp +
      accessTokenExpireInMillisecond -
      DEFAULT_BEFORE_EXPIRED;
    return Date.now() > lastValidTime;
  }

  async onBoardingPreparation() {
    const profileService = ServiceLoader.getInstance<ProfileService>(
      ServiceConfig.PROFILE_SERVICE,
    );
    await profileService.markMeConversationAsFav().catch((error: Error) => {
      mainLogger.tags(LOG_TAG).info('markMeConversationAsFav fail:', error);
    });
  }

  getUnreadToggleSetting() {
    return (
      this.userConfig.getUnreadToggleSetting() || DEFAULT_UNREAD_TOGGLE_SETTING
    );
  }

  setUnreadToggleSetting(value: boolean) {
    this.userConfig.setUnreadToggleSetting(value);
  }

  checkServerStatus(callback: (success: boolean, retryAfter: number) => void) {
    RCAuthApi.requestServerStatus(callback);
  }

  onRefreshTokenFailure(forceLogout: boolean) {
    if (forceLogout) {
      mainLogger.tags(LOG_TAG).info('Refresh Token failed, force logout.');
      notificationCenter.emitKVChange(SERVICE.DO_SIGN_OUT);
    }
  }

  isGlipLogin(): boolean {
    const userDict = AccountGlobalConfig.getUserDictionary();
    if (!userDict) {
      return false;
    }
    return this.userConfig && !!this.userConfig.getGlipUserId();
  }

  async unifiedLogin({ code, token }: IUnifiedLogin) {
    await this.getAuthController().unifiedLogin({ code, token });
  }

  async login(params: ILogin) {
    await this.getAuthController().login(params);
  }

  async loginGlip(params: ILogin) {
    await this.getAuthController().loginGlip(params);
  }

  async makeSureUserInWhitelist() {
    await this.getAuthController().makeSureUserInWhitelist();
  }

  async logout() {
    await this.getAuthController().logout();
  }

  isLoggedIn(): boolean {
    return this.getAuthController().isLoggedIn();
  }

  scheduleReLoginGlipJob() {
    this.getAuthController().scheduleReLoginGlipJob();
  }

  async reLoginGlip(): Promise<boolean> {
    return await this.getAuthController().reLoginGlip();
  }
}

export { AccountService };
