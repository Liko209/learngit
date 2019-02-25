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
  if (userId) {
    notificationCenter.emitKVChange(ACCOUNT_USER_ID, userId);
    AccountGlobalConfig.getInstance().setCurrentUserId(userId);
  }
  if (companyId) {
    notificationCenter.emitKVChange(ACCOUNT_COMPANY_ID, companyId);
    AccountGlobalConfig.getInstance().setCurrentCompanyId(companyId);
  }
  if (profileId) {
    notificationCenter.emitKVChange(ACCOUNT_PROFILE_ID, profileId);
    AccountGlobalConfig.getInstance().setCurrentUserProfileId(profileId);
  }
  if (clientConfig) {
    notificationCenter.emitKVChange(ACCOUNT_CLIENT_CONFIG, clientConfig);
    const accountConfig = new AccountUserConfig();
    accountConfig.setClientConfig(clientConfig);
  }
};

export default accountHandleData;
