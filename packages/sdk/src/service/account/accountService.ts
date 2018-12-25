/*
 * @Author: Thomas thomas.yang@ringcentral.com
 * @Date: 2018-11-15 10:47:06
 * Copyright © RingCentral. All rights reserved.
 */
import { mainLogger, BaseError } from 'foundation';
import BaseService from '../../service/BaseService';
import {
  ACCOUNT_USER_ID,
  ACCOUNT_PROFILE_ID,
  ACCOUNT_COMPANY_ID,
  UNREAD_TOGGLE_ON,
} from '../../dao/account/constants';
import { daoManager, AuthDao } from '../../dao';
import AccountDao from '../../dao/account';
import PersonDao from '../../dao/person';
import ConfigDao from '../../dao/config';
import { CLIENT_ID } from '../../dao/config/constants';
import { UserInfo } from '../../models';
import { generateUUID } from '../../utils/mathUtils';
import { refreshToken, ITokenRefreshDelegate, ITokenModel } from '../../api';
import { AUTH_RC_TOKEN } from '../../dao/auth/constants';
import { Aware, ErrorTypes } from '../../utils/error';
import notificationCenter from '../notificationCenter';
import ProfileService from '../profile/index';
import { setRcToken } from '../../authenticator';

const DEFAULT_UNREAD_TOGGLE_SETTING = false;
class AccountService extends BaseService implements ITokenRefreshDelegate {
  static serviceName = 'AccountService';

  private accountDao: AccountDao;
  constructor() {
    super();
    this.accountDao = daoManager.getKVDao(AccountDao);
  }

  isAccountReady(): boolean {
    return !!this.accountDao.get(ACCOUNT_USER_ID);
  }

  getCurrentUserId(): number {
    const userId: string = this.accountDao.get(ACCOUNT_USER_ID);
    if (!userId) {
      // Current user id not found is a unexpected error,
      // the error should be throw to tell developer that there
      // must be some bug happened.
      mainLogger.warn('Current user id not found.');
      throw new BaseError(
        ErrorTypes.SERVICE,
        'ServiceError: Current user id not found.',
      );
    }
    return Number(userId);
  }

  getCurrentUserProfileId(): number {
    const profileId = this.accountDao.get(ACCOUNT_PROFILE_ID);
    if (!profileId) {
      // Current user profileId not found is a unexpected error,
      // the error should be throw to tell developer that there
      // must be some bug happened.
      mainLogger.warn('Current profile id not found.');
      throw new BaseError(
        ErrorTypes.SERVICE,
        'ServiceError: Current profile id not found.',
      );
    }
    return Number(profileId);
  }

  getCurrentCompanyId(): number {
    const companyId = this.accountDao.get(ACCOUNT_COMPANY_ID);
    if (!companyId) {
      // Current user companyId not found is a unexpected error,
      // the error should be throw to tell developer that there
      // must be some bug happened.
      mainLogger.warn('Current company id not found.');
      throw new BaseError(
        ErrorTypes.SERVICE,
        'ServiceError: Current company id not found.',
      );
    }
    return Number(companyId);
  }

  async getCurrentUserInfo(): Promise<UserInfo | {}> {
    const userId = Number(this.accountDao.get(ACCOUNT_USER_ID));
    const company_id = Number(this.accountDao.get(ACCOUNT_COMPANY_ID));
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
    const userId = Number(this.accountDao.get(ACCOUNT_USER_ID));
    if (!userId) return '';
    const personDao = daoManager.getDao(PersonDao);
    const personInfo = await personDao.get(userId);
    if (!personInfo) return '';
    return personInfo.email;
  }

  getClientId(): string {
    const configDao = daoManager.getKVDao(ConfigDao);
    let id = configDao.get(CLIENT_ID);
    if (id) {
      return id;
    }
    id = generateUUID();
    configDao.put(CLIENT_ID, id);
    return id;
  }

  async refreshRCToken(): Promise<ITokenModel | null> {
    const authDao = daoManager.getKVDao(AuthDao);
    try {
      const oldRcToken = authDao.get(AUTH_RC_TOKEN);
      const refreshResult = await refreshToken(oldRcToken);
      const newRcToken = refreshResult.expect('Failed to refresh rcToken');
      setRcToken(newRcToken);
      notificationCenter.emitKVChange(AUTH_RC_TOKEN, newRcToken);
      return newRcToken;
    } catch (err) {
      Aware(ErrorTypes.OAUTH, err.message);
      return null;
    }
  }

  async onBoardingPreparation() {
    const profileService: ProfileService = ProfileService.getInstance();
    await profileService.markMeConversationAsFav();
  }

  getUnreadToggleSetting() {
    return (
      this.accountDao.get(UNREAD_TOGGLE_ON) || DEFAULT_UNREAD_TOGGLE_SETTING
    );
  }

  setUnreadToggleSetting(value: boolean) {
    this.accountDao.put(UNREAD_TOGGLE_ON, value);
  }
}

export { AccountService };
