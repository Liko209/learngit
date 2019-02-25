/*
 * @Author: Thomas thomas.yang@ringcentral.com
 * @Date: 2018-11-15 10:47:06
 * Copyright © RingCentral. All rights reserved.
 */
import { mainLogger } from 'foundation';
import BaseService from '../../service/BaseService';
import { daoManager } from '../../dao';
import { PersonDao } from '../../module/person/dao';
import { UserInfo } from '../../models';
import { generateUUID } from '../../utils/mathUtils';
import { refreshToken, ITokenRefreshDelegate, ITokenModel } from '../../api';
import { AUTH_RC_TOKEN } from '../../dao/auth/constants';
import { Aware } from '../../utils/error';
import notificationCenter from '../notificationCenter';
import ProfileService from '../profile/index';
import { setRcToken } from '../../authenticator';
import { ERROR_CODES_SDK } from '../../error';
import { AccountGlobalConfig, AccountUserConfig } from './config';
import { AuthGlobalConfig } from '../../service/auth/config';
import { NewGlobalConfig } from '../../service/config';

const DEFAULT_UNREAD_TOGGLE_SETTING = false;

class AccountService extends BaseService implements ITokenRefreshDelegate {
  static serviceName = 'AccountService';
  private _userConfig: AccountUserConfig;

  constructor() {
    super();
    this._userConfig = new AccountUserConfig();
    const userId = AccountGlobalConfig.getInstance().getCurrentUserId();
    if (userId) {
      this._userConfig.setUserId(userId);
    }
  }

  isAccountReady(): boolean {
    return !!AccountGlobalConfig.getInstance().getCurrentUserId();
  }

  async getCurrentUserInfo(): Promise<UserInfo | {}> {
    const userId = Number(AccountGlobalConfig.getInstance().getCurrentUserId());
    const company_id = Number(
      AccountGlobalConfig.getInstance().getCurrentCompanyId(),
    );
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
    const userId = Number(AccountGlobalConfig.getInstance().getCurrentUserId());
    if (!userId) return '';
    const personDao = daoManager.getDao(PersonDao);
    const personInfo = await personDao.get(userId);
    if (!personInfo) return '';
    return personInfo.email;
  }

  getClientId(): string {
    let id = NewGlobalConfig.getInstance().getClientId();
    if (id) {
      return id;
    }
    id = generateUUID();
    NewGlobalConfig.getInstance().setClientId(id);
    return id;
  }

  async refreshRCToken(): Promise<ITokenModel | null> {
    const authConfig = AuthGlobalConfig.getInstance();
    try {
      const oldRcToken = authConfig.getRcToken();
      const refreshResult = await refreshToken(oldRcToken);
      const newRcToken = refreshResult.expect('Failed to refresh rcToken');
      setRcToken(newRcToken);
      notificationCenter.emitKVChange(AUTH_RC_TOKEN, newRcToken);
      return newRcToken;
    } catch (err) {
      Aware(ERROR_CODES_SDK.OAUTH, err.message);
      return null;
    }
  }

  async onBoardingPreparation() {
    const profileService: ProfileService = ProfileService.getInstance();
    await profileService.markMeConversationAsFav();
  }

  getUnreadToggleSetting() {
    return (
      this._userConfig.getUnreadToggleSetting() || DEFAULT_UNREAD_TOGGLE_SETTING
    );
  }

  setUnreadToggleSetting(value: boolean) {
    this._userConfig.setUnreadToggleSetting(value);
  }
}

export { AccountService };
