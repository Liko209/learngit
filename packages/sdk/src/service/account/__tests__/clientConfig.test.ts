/*
 * @Author: Lip Wang (lip.wangn@ringcentral.com)
 * @Date: 2018-03-01 14:02:24
 */

import { daoManager, AccountDao } from '../../../dao';
import {
  ACCOUNT_CLIENT_CONFIG,
  ACCOUNT_USER_ID,
  ACCOUNT_COMPANY_ID,
} from '../../../dao/account/constants';
import { EBETA_FLAG, isInBeta } from '../clientConfig';

describe('Client Config', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it('beta log', async () => {
    const dao = daoManager.getKVDao(AccountDao);
    dao.put(ACCOUNT_CLIENT_CONFIG, {
      beta_enable_log_emails: '123,234,456',
      beta_enable_log_domains: '1,2,3,4',
    });
    dao.put(ACCOUNT_USER_ID, 123);
    expect(isInBeta(EBETA_FLAG.BETA_LOG)).toEqual(true);

    dao.put(ACCOUNT_USER_ID, 10);
    expect(isInBeta(EBETA_FLAG.BETA_LOG)).toEqual(false);

    dao.put(ACCOUNT_COMPANY_ID, 4);
    expect(isInBeta(EBETA_FLAG.BETA_LOG)).toEqual(true);
  });
});
