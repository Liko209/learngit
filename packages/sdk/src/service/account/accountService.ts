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
import { Aware } from '../../utils/error';
import notificationCenter from '../notificationCenter';
import { SERVICE } from '../eventKey';
import { ProfileService } from '../../module/profile';
import { setRcToken } from '../../authenticator/utils';
import { ERROR_CODES_SDK } from '../../error';
import { AccountUserConfig } from '../../service/account/config';
import { AuthUserConfig } from '../../service/auth/config';

const DEFAULT_UNREAD_TOGGLE_SETTING = false;
class AccountService extends BaseService implements IPlatformHandleDelegate {
  static serviceName = 'AccountService';

  constructor() {
    super();
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
    try {
      const authConfig = new AuthUserConfig();
      const oldRcToken = authConfig.getRcToken();
      const newRcToken = (await refreshToken(oldRcToken)) as ITokenModel;
      setRcToken(newRcToken);
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

  onRefreshTokenFailure() {
    notificationCenter.emitKVChange(SERVICE.DO_SIGN_OUT);
  }
}

export { AccountService };
