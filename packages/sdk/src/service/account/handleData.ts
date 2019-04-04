/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-04-16 09:35:24
 * Copyright © RingCentral. All rights reserved.
 */
import {
  ACCOUNT_USER_ID,
  ACCOUNT_PROFILE_ID,
  ACCOUNT_COMPANY_ID,
  ACCOUNT_CLIENT_CONFIG,
} from '../../dao/account/constants';
import notificationCenter from '../../service/notificationCenter';
import { AccountGlobalConfig, AccountUserConfig } from './config';
import { ACCOUNT_TYPE_ENUM } from '../../authenticator/constants';
import { PerformanceTracerHolder, PERFORMANCE_KEYS } from '../../utils';

export interface IHandleData {
  userId?: number;
  companyId?: number;
  profileId?: number;
  clientConfig?: object;
}

const accountHandleData = ({
  userId,
  companyId,
  profileId,
  clientConfig,
}: IHandleData): void => {
  const logId = Date.now();
  PerformanceTracerHolder.getPerformanceTracer().start(
    PERFORMANCE_KEYS.HANDLE_INCOMING_ACCOUNT,
    logId,
  );
  let userConfig = new AccountUserConfig();
  if (userId) {
    if (!AccountGlobalConfig.getUserDictionary()) {
      // by default, rc extension id will be used as UD. For glip only user, we'll use glip id as UD
      AccountGlobalConfig.setUserDictionary(userId.toString());
      userConfig = new AccountUserConfig();
      userConfig.setAccountType(ACCOUNT_TYPE_ENUM.GLIP);
    }
    notificationCenter.emitKVChange(ACCOUNT_USER_ID, userId);
    userConfig.setGlipUserId(userId);
  }

  if (companyId) {
    notificationCenter.emitKVChange(ACCOUNT_COMPANY_ID, companyId);
    userConfig.setCurrentCompanyId(companyId);
  }
  if (profileId) {
    notificationCenter.emitKVChange(ACCOUNT_PROFILE_ID, profileId);
    userConfig.setCurrentUserProfileId(profileId);
  }
  if (clientConfig) {
    notificationCenter.emitKVChange(ACCOUNT_CLIENT_CONFIG, clientConfig);
    userConfig.setClientConfig(clientConfig);
  }
  PerformanceTracerHolder.getPerformanceTracer().end(logId);
};

export default accountHandleData;
