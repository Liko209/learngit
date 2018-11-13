/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-04-16 09:35:24
 * Copyright © RingCentral. All rights reserved.
 */
import { daoManager } from '../../dao';
import AccountDao from '../../dao/account';
import {
  ACCOUNT_USER_ID,
  ACCOUNT_PROFILE_ID,
  ACCOUNT_COMPANY_ID,
  ACCOUNT_CLIENT_CONFIG,
} from '../../dao/account/constants';
import notificationCenter from '../../service/notificationCenter';

export interface IHandleData {
  userId?: number;
  companyId?: number;
  profileId?: number;
  clientConfig?: object;
}

const accountHandleData = ({ userId, companyId, profileId, clientConfig }: IHandleData): void => {
  const dao = daoManager.getKVDao(AccountDao);
  if (userId) {
    notificationCenter.emitKVChange(ACCOUNT_USER_ID, userId);
    dao.put(ACCOUNT_USER_ID, userId);
  }
  if (companyId) {
    notificationCenter.emitKVChange(ACCOUNT_COMPANY_ID, companyId);
    dao.put(ACCOUNT_COMPANY_ID, companyId);
  }
  if (profileId) {
    notificationCenter.emitKVChange(ACCOUNT_PROFILE_ID, profileId);
    dao.put(ACCOUNT_PROFILE_ID, profileId);
  }
  if (clientConfig) {
    notificationCenter.emitKVChange(ACCOUNT_CLIENT_CONFIG, clientConfig);
    dao.put(ACCOUNT_CLIENT_CONFIG, clientConfig);
  }
};

export default accountHandleData;
