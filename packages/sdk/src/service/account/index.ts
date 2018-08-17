/*
 * @Author: Lip Wang (lip.wangn@ringcentral.com)
 * @Date: 2018-07-12 13:59:49
 * Copyright © RingCentral. All rights reserved
*/

import BaseService from '../../service/BaseService';
import {
  ACCOUNT_USER_ID,
  ACCOUNT_PROFILE_ID,
  ACCOUNT_COMPANY_ID,
} from '../../dao/account/constants';
import { daoManager, AuthDao } from '../../dao';
import AccountDao from '../../dao/account';
import PersonDao from '../../dao/person';
import ConfigDao from '../../dao/config';
import { CLIENT_ID } from '../../dao/config/constants';
import { UserInfo } from '../../models';
import { mainLogger } from 'foundation';
import { generateUUID } from '../../utils/mathUtils';
import { refreshToken, ITokenRefreshDelegate } from '../../api';
import { AUTH_RC_TOKEN } from '../../dao/auth/constants';
import { Aware, ErrorTypes } from '../../utils/error';
import notificationCenter from '../notificationCenter';
export default class AccountService extends BaseService implements ITokenRefreshDelegate {
  static serviceName = 'AccountService';

  private accountDao: AccountDao;
  constructor() {
    super();
    this.accountDao = daoManager.getKVDao(AccountDao);
  }

  getCurrentUserId(): number | null {
    const userId: string = this.accountDao.get(ACCOUNT_USER_ID);
    if (!userId) {
      mainLogger.warn('there is not UserId Id');
      return null;
    }
    return Number(userId);
  }

  getCurrentUserProfileId(): number | null {
    const profileId = this.accountDao.get(ACCOUNT_PROFILE_ID);
    if (!profileId) {
      mainLogger.warn('there is not profile Id');
      return null;
    }
    return Number(profileId);
  }

  getCurrentCompanyId(): number | null {
    const companyId = this.accountDao.get(ACCOUNT_COMPANY_ID);
    if (!companyId) {
      mainLogger.warn('there is not companyId Id');
      return null;
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

  async refreshRCToken() {
    const authDao = daoManager.getKVDao(AuthDao);
    try {
      const rcToken = authDao.get(AUTH_RC_TOKEN);
      const { refresh_token, endpoint_id } = rcToken;
      const refreshedRCAuthData = await refreshToken({ refresh_token, endpoint_id });
      authDao.put(AUTH_RC_TOKEN, refreshedRCAuthData.data);
      notificationCenter.emitConfigPut(AUTH_RC_TOKEN, refreshedRCAuthData.data);
      return refreshedRCAuthData.data;
    } catch (err) {
      Aware(ErrorTypes.OAUTH, err.message);
      return null;
    }
  }
}
