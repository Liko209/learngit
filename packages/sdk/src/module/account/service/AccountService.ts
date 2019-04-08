/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2019-04-03 14:01:19
 * Copyright © RingCentral. All rights reserved.
 */

import { mainLogger } from 'foundation';
import { daoManager } from '../../../dao';
import { PersonDao } from '../../person/dao';
import { UserInfo } from '../../../models';
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

const DEFAULT_UNREAD_TOGGLE_SETTING = false;
class AccountService extends AbstractService
  implements IPlatformHandleDelegate {
  static serviceName = 'AccountService';
  static _instance: AccountService;

  private _authController: AuthController;

  constructor(private _accountManager: AccountManager) {
    super();
  }

  protected onStarted() {}
  protected onStopped() {}

  getAuthController() {
    if (!this._authController) {
      this._authController = new AuthController(this._accountManager);
    }
    return this._authController;
  }

  isAccountReady(): boolean {
    const userConfig = new AccountUserConfig();
    return userConfig.getGlipUserId() ? true : false;
  }

  async getCurrentUserInfo(): Promise<UserInfo | {}> {
    const userConfig = new AccountUserConfig();
    const userId = userConfig.getGlipUserId();
    const company_id = Number(userConfig.getCurrentCompanyId());
    if (!userId) return {};
    const personDao = daoManager.getDao(PersonDao);
    const personInfo = await personDao.get(userId);
    if (!personInfo) return {};
    mainLogger.debug(`getCurrentUserInfo: ${personInfo}`);
    return {
      company_id,
      email: personInfo.email,
      display_name: personInfo.display_name,
    } as UserInfo;
  }

  async getUserEmail(): Promise<string> {
    const userConfig = new AccountUserConfig();
    const userId = userConfig.getGlipUserId();
    if (!userId) return '';
    const personDao = daoManager.getDao(PersonDao);
    const personInfo = await personDao.get(userId);
    if (!personInfo) return '';
    return personInfo.email;
  }

  getClientId(): string {
    const userConfig = new AccountUserConfig();
    let id = userConfig.getClientId();
    if (id) {
      return id;
    }
    id = generateUUID();
    userConfig.setClientId(id);
    return id;
  }

  async refreshRCToken(): Promise<ITokenModel | null> {
    const authConfig = new AuthUserConfig();
    const oldRcToken = authConfig.getRCToken();
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
    const userConfig = new AccountUserConfig();
    return userConfig.getUnreadToggleSetting() || DEFAULT_UNREAD_TOGGLE_SETTING;
  }

  setUnreadToggleSetting(value: boolean) {
    const userConfig = new AccountUserConfig();
    userConfig.setUnreadToggleSetting(value);
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
    const userConfig = new AccountUserConfig();
    return userConfig && userConfig.getGlipUserId() !== null;
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

  async loginGlip2(params: ILogin) {
    await this.getAuthController().loginGlip2(params);
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
