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
} from '../../../dao/account/constants';
import notificationCenter from '../../../service/notificationCenter';
import { AccountService } from '../service';
import { ServiceLoader, ServiceConfig } from '../../serviceLoader';
import { PerformanceTracer, PERFORMANCE_KEYS } from '../../../utils';
import { AccountGlobalConfig } from '../config';
import { ACCOUNT_TYPE_ENUM } from 'sdk/authenticator/constants';

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
  const performanceTracer = PerformanceTracer.initial();

  // should set UserDictionary before handle data for free user
  if (!AccountGlobalConfig.getUserDictionary()) {
    if (!userId) {
      throw new Error('can not get id for free user');
    }
    // by default, rc extension id will be used as UD. For glip only user, we'll use glip id as UD
    AccountGlobalConfig.setUserDictionary(userId.toString());
    ServiceLoader.getInstance<AccountService>(
      ServiceConfig.ACCOUNT_SERVICE,
    ).userConfig.setAccountType(ACCOUNT_TYPE_ENUM.GLIP);
  }

  const userConfig = ServiceLoader.getInstance<AccountService>(
    ServiceConfig.ACCOUNT_SERVICE,
  ).userConfig;
  if (userId) {
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
  performanceTracer.end({ key: PERFORMANCE_KEYS.HANDLE_INCOMING_ACCOUNT });
};

export { accountHandleData };
