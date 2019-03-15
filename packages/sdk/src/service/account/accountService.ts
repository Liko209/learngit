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
import {
  refreshToken,
  IPlatformHandleDelegate,
  ITokenModel,
  requestServerStatus,
} from '../../api';
import { AUTH_RC_TOKEN } from '../../dao/auth/constants';
import { Aware } from '../../utils/error';
import notificationCenter from '../notificationCenter';
import { ProfileService } from '../../module/profile';
import { setRcToken } from '../../authenticator';
import { ERROR_CODES_SDK } from '../../error';
import {
  AccountGlobalConfig,
  AccountUserConfig,
} from '../../service/account/config';
import { AuthGlobalConfig } from '../../service/auth/config';

const DEFAULT_UNREAD_TOGGLE_SETTING = false;
class AccountService extends BaseService implements IPlatformHandleDelegate {
  static serviceName = 'AccountService';

  constructor() {
    super();
  }

  isAccountReady(): boolean {
    return !!AccountGlobalConfig.getCurrentUserId();
  }

  async getCurrentUserInfo(): Promise<UserInfo | {}> {
    const userId = Number(AccountGlobalConfig.getCurrentUserId());
    const company_id = Number(AccountGlobalConfig.getCurrentCompanyId());
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
    const userId = Number(AccountGlobalConfig.getCurrentUserId());
    if (!userId) return '';
    const personDao = daoManager.getDao(PersonDao);
    const personInfo = await personDao.get(userId);
    if (!personInfo) return '';
    return personInfo.email;
  }

  getClientId(): string {
    let id = AccountGlobalConfig.getClientId();
    if (id) {
      return id;
    }
    id = generateUUID();
    AccountGlobalConfig.setClientId(id);
    return id;
  }

  async refreshRCToken(): Promise<ITokenModel | null> {
    try {
      const oldRcToken = AuthGlobalConfig.getRcToken();
      const newRcToken = (await refreshToken(oldRcToken)) as ITokenModel;
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
    requestServerStatus(callback);
  }
}

export { AccountService };
