/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2019-04-03 14:01:19
 * Copyright © RingCentral. All rights reserved.
 */

import { mainLogger } from 'foundation/log';
import { JError } from 'foundation/error';
import { IToken } from 'foundation/network';
import { PersonService } from '../../person';
import { Person } from '../../person/entity';
import { generateUUID } from '../../../utils/mathUtils';
import {
  IPlatformHandleDelegate,
  ITokenModel,
  RCAuthApi,
  HandleByRingCentral,
} from '../../../api';
import notificationCenter, { NotificationEntityUpdatePayload } from '../../../service/notificationCenter';
import { SERVICE, SOCKET, ENTITY } from '../../../service/eventKey';
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
import {
  AbstractService,
  AccountManager,
  GLIP_LOGIN_STATUS,
} from '../../../framework';
import { ServiceLoader, ServiceConfig } from '../../serviceLoader';
import { Nullable, UndefinedAble } from '../../../types';
import { ISubscribeController } from 'sdk/framework/controller/interface/ISubscribeController';
import { SubscribeController } from 'sdk/module/base/controller/SubscribeController';
import { UserPermission } from 'sdk/module/permission/entity';
import { UserPermissionType } from 'sdk/module/permission';

const DEFAULT_UNREAD_TOGGLE_SETTING = false;
const LOG_TAG = 'AccountService';

type refreshTokenCallBack = {
  resolve: (token: ITokenModel | null) => void;
  reject: (reason: JError) => void;
};

class AccountService extends AbstractService
  implements IPlatformHandleDelegate {
  static serviceName = 'AccountService';
  static _instance: AccountService;

  private _refreshTokenQueue: refreshTokenCallBack[] = [];
  private _isRefreshingToken: boolean;
  private _authController: AuthController;
  private _userConfig: AccountUserConfig;
  private _authUserConfig: AuthUserConfig;
  private _subscribeController: ISubscribeController;

  constructor(private _accountManager: AccountManager) {
    super();
    this._subscribeController = SubscribeController.buildSubscriptionController(
      {
        [SOCKET.LOGOUT]: this.onGlipForceLogout,
        [ENTITY.USER_PERMISSION]: this.onPermissionUpdated
      },
    );
  }

  protected onStarted() {
    if (this._subscribeController) {
      this._subscribeController.subscribe();
    }
  }
  protected onStopped() {
    if (this._subscribeController) {
      this._subscribeController.unsubscribe();
    }
    delete this._subscribeController;
  }

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
    try {
      return this.userConfig.getGlipUserId() ? true : false;
    } catch {
      return false;
    }
  }

  async getCurrentUserInfo(): Promise<Nullable<Person>> {
    if (!this.isAccountReady()) {
      return null;
    }
    const personService = ServiceLoader.getInstance<PersonService>(
      ServiceConfig.PERSON_SERVICE,
    );
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
      return new Promise<ITokenModel | null>((resolve, reject) => {
        this._refreshTokenQueue.push({ resolve, reject });
      });
    }

    this._isRefreshingToken = true;
    const result = await this._doRefreshRCToken()
      .catch((reason: JError) => {
        this._refreshTokenQueue.forEach((response: refreshTokenCallBack) => {
          response.reject(reason);
        });
        this._refreshTokenQueue = [];
        throw reason;
      })
      .finally(() => {
        this._isRefreshingToken = false;
      });
    this._refreshTokenQueue.forEach((response: refreshTokenCallBack) => {
      response.resolve(result);
    });
    this._refreshTokenQueue = [];
    return result;
  }

  private async _doRefreshRCToken(): Promise<ITokenModel | null> {
    const oldRcToken = this.authUserConfig.getRCToken();
    const newRcToken = (await RCAuthApi.refreshToken(
      oldRcToken,
    )) as ITokenModel;
    setRCToken(newRcToken);
    return newRcToken;
  }

  async getRCToken(): Promise<UndefinedAble<IToken>> {
    const tokenManager = RCAuthApi.networkManager.getTokenManager();
    return tokenManager && tokenManager.getOAuthToken(HandleByRingCentral);
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

  onPermissionUpdated = (payload: NotificationEntityUpdatePayload<UserPermission>) => {
    if (payload) {
      const userPermissions: UserPermission[] = Array.from(payload.body.entities.values());
      if (userPermissions && userPermissions[0].permissions[UserPermissionType.USERS_BLACKLIST]) {
          mainLogger.tags(LOG_TAG).info('User in blacklist, then force logout.');
          this.onForceLogout(true);
      }
    }
  };

  onRefreshTokenFailure(forceLogout: boolean) {
    mainLogger
      .tags(LOG_TAG)
      .info('Refresh Token failed, force logout:', forceLogout);
    this.onForceLogout(forceLogout);
  }

  onGlipForceLogout = (forceLogout: boolean) => {
    mainLogger.tags(LOG_TAG).info('Glip force logout:', forceLogout);
    this.onForceLogout(forceLogout);
  };

  onForceLogout(forceLogout: boolean) {
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

  isRCOnlyMode(): boolean {
    return this.getAuthController().isRCOnlyMode();
  }

  getGlipLoginStatus(): GLIP_LOGIN_STATUS {
    if (this.isAccountReady()) {
      this._accountManager.setGlipLoginStatus(GLIP_LOGIN_STATUS.SUCCESS);
    }
    return this.getAuthController().getGlipLoginStatus();
  }

  startLoginGlip() {
    this.getAuthController().startLoginGlip();
  }
}

export { AccountService };
