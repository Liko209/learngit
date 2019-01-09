/*
 * @Author: Thomas thomas.yang@ringcentral.com
 * @Date: 2019-01-07 10:52:45
 * Copyright © RingCentral. All rights reserved.
 */

import { mainLogger } from 'foundation';
import {
  ACCOUNT_USER_ID,
  ACCOUNT_PROFILE_ID,
  ACCOUNT_COMPANY_ID,
} from '../../dao/account/constants';
import { daoManager, AccountDao } from '../../dao';
import { JServerError, JSdkError, ERROR_CODES_SDK } from '../../error';
class UserConfig {
  static getCurrentUserProfileId(): number {
    const accountDao = daoManager.getKVDao(AccountDao);
    const profileId = accountDao.get(ACCOUNT_PROFILE_ID);
    if (!profileId) {
      // Current user profileId not found is a unexpected error,
      // the error should be throw to tell developer that there
      // must be some bug happened.
      mainLogger.warn('Current profile id not found.');
      throw new JServerError(
        ERROR_CODES_SDK.GENERAL,
        'ServiceError: Current profile id not found.',
      );
    }
    return Number(profileId);
  }

  static getCurrentUserId(): number {
    const accountDao = daoManager.getKVDao(AccountDao);
    const userId: string = accountDao.get(ACCOUNT_USER_ID);
    if (!userId) {
      // Current user id not found is a unexpected error,
      // the error should be throw to tell developer that there
      // must be some bug happened.
      mainLogger.warn('Current user id not found.');
      throw new JServerError(
        ERROR_CODES_SDK.GENERAL,
        'ServiceError: Current user id not found.',
      );
    }
    return Number(userId);
  }

  static getCurrentCompanyId(): number {
    const accountDao = daoManager.getKVDao(AccountDao);
    const companyId = accountDao.get(ACCOUNT_COMPANY_ID);
    if (!companyId) {
      // Current user companyId not found is a unexpected error,
      // the error should be throw to tell developer that there
      // must be some bug happened.
      mainLogger.warn('Current company id not found.');
      throw new JSdkError(
        ERROR_CODES_SDK.GENERAL,
        'ServiceError: Current company id not found.',
      );
    }
    return Number(companyId);
  }
}

export { UserConfig };
