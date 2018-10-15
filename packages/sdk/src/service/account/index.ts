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
  ACCOUNT_CONVERSATION_LIST_LIMITS,
} from '../../dao/account/constants';
import { daoManager, AuthDao } from '../../dao';
import AccountDao from '../../dao/account';
import PersonDao from '../../dao/person';
import ConfigDao from '../../dao/config';
import { CLIENT_ID } from '../../dao/config/constants';
import { UserInfo } from '../../models';
import { mainLogger } from 'foundation';
import { generateUUID } from '../../utils/mathUtils';
import { refreshToken, ITokenRefreshDelegate, ITokenModel } from '../../api';
import { AUTH_RC_TOKEN } from '../../dao/auth/constants';
import { Aware, ErrorTypes } from '../../utils/error';
import notificationCenter from '../notificationCenter';
import { GROUP_QUERY_TYPE } from '../constants';
import ProfileService from '../profile/index';

const DEFAULT_CONVERSATION_LIST_LIMITS = {
  [GROUP_QUERY_TYPE.ALL]: 20,
  [GROUP_QUERY_TYPE.TEAM]: 20,
  [GROUP_QUERY_TYPE.GROUP]: 20,
  [GROUP_QUERY_TYPE.FAVORITE]: Infinity,
};

type ConversationListLimits = typeof DEFAULT_CONVERSATION_LIST_LIMITS;

class AccountService extends BaseService implements ITokenRefreshDelegate {
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

  async refreshRCToken(): Promise<ITokenModel | null> {
    const authDao = daoManager.getKVDao(AuthDao);
    try {
      const rcToken = authDao.get(AUTH_RC_TOKEN);
      const { refresh_token, endpoint_id } = rcToken;
      const refreshedRCAuthData = await refreshToken({
        refresh_token,
        endpoint_id,
      });
      authDao.put(AUTH_RC_TOKEN, refreshedRCAuthData.data);
      notificationCenter.emitConfigPut(AUTH_RC_TOKEN, refreshedRCAuthData.data);
      return refreshedRCAuthData.data;
    } catch (err) {
      Aware(ErrorTypes.OAUTH, err.message);
      return null;
    }
  }

  setConversationListLimits(limits: ConversationListLimits): void {
    this.accountDao.put(ACCOUNT_CONVERSATION_LIST_LIMITS, limits);
  }

  setConversationListLimit(type: GROUP_QUERY_TYPE, limit: number): void {
    const conversationListLimits = this.getConversationListLimits();
    conversationListLimits[type] = limit;
    this.setConversationListLimits(conversationListLimits);
  }

  getConversationListLimits(): ConversationListLimits {
    return (
      this.accountDao.get(ACCOUNT_CONVERSATION_LIST_LIMITS) ||
      DEFAULT_CONVERSATION_LIST_LIMITS
    );
  }

  getConversationListLimit(type: GROUP_QUERY_TYPE) {
    return this.getConversationListLimits()[type];
  }

  async onBoardingPreparation() {
    const profileService: ProfileService = ProfileService.getInstance();
    await profileService.markMeConversationAsFav();
  }
}

export default AccountService;
export { ConversationListLimits };
