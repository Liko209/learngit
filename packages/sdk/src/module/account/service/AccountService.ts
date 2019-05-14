/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2019-04-03 14:01:19
 * Copyright © RingCentral. All rights reserved.
 */

import { mainLogger } from 'foundation';
import { PersonService } from '../../person';
import { Person } from '../../person/entity';
import { generateUUID } from '../../../utils/mathUtils';
import { IPlatformHandleDelegate, ITokenModel, RCAuthApi } from '../../../api';
import notificationCenter from '../../../service/notificationCenter';
import { SERVICE } from '../../../service/eventKey';
import { ProfileService } from '../../profile';
import { setRCToken } from '../../../authenticator/utils';
import {
  AccountUserConfig,
  AccountGlobalConfig,
  AuthUserConfig,
} from '../config';
import {
  AuthController,
  IUnifiedLogin,
  ILogin,
} from '../controller/AuthController';
import { AbstractService, AccountManager } from '../../../framework';
import { ServiceLoader, ServiceConfig } from '../../serviceLoader';
import { Nullable } from '../../../types';

const DEFAULT_UNREAD_TOGGLE_SETTING = false;
class AccountService extends AbstractService
  implements IPlatformHandleDelegate {
  static serviceName = 'AccountService';
  static _instance: AccountService;

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
      mainLogger.debug('Get user info fail:', error);
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
    const oldRcToken = this.authUserConfig.getRCToken();
    const newRcToken = (await RCAuthApi.refreshToken(
      oldRcToken,
    )) as ITokenModel;
    setRCToken(newRcToken);
    return newRcToken;
  }

  async onBoardingPreparation() {
    const profileService = ServiceLoader.getInstance<ProfileService>(
      ServiceConfig.PROFILE_SERVICE,
    );
    await profileService.markMeConversationAsFav().catch((error: Error) => {
      mainLogger
        .tags('AccountService')
        .info('markMeConversationAsFav fail:', error);
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
