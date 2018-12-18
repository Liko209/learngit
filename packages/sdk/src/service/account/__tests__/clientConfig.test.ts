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
    jest.resetAllMocks();
    jest.restoreAllMocks();
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

  it('should return true when user id is in beta list', () => {
    const dao = daoManager.getKVDao(AccountDao);
    dao.put(ACCOUNT_CLIENT_CONFIG, {
      beta_s3_direct_uploads_emails: '123,234,456',
      beta_s3_direct_uploads_domains: '1,2,3,4',
    });

    dao.put(ACCOUNT_USER_ID, 123);
    dao.put(ACCOUNT_COMPANY_ID, 5);

    expect(isInBeta(EBETA_FLAG.BETA_S3_DIRECT_UPLOADS)).toEqual(true);
  });

  it('should return false when user id is not in beta list', () => {
    const dao = daoManager.getKVDao(AccountDao);
    dao.put(ACCOUNT_CLIENT_CONFIG, {
      beta_s3_direct_uploads_emails: '123,234,456',
      beta_s3_direct_uploads_domains: '1,2,3,4',
    });

    dao.put(ACCOUNT_USER_ID, 123);
    dao.put(ACCOUNT_COMPANY_ID, 5);

    expect(isInBeta(EBETA_FLAG.BETA_S3_DIRECT_UPLOADS)).toEqual(true);
  });

  it('should return true when user company is in beta domain list', () => {
    const dao = daoManager.getKVDao(AccountDao);
    dao.put(ACCOUNT_CLIENT_CONFIG, {
      beta_s3_direct_uploads_emails: '123,234,456',
      beta_s3_direct_uploads_domains: '1,2,3,4',
    });

    dao.put(ACCOUNT_USER_ID, 567);
    dao.put(ACCOUNT_COMPANY_ID, 3);

    expect(isInBeta(EBETA_FLAG.BETA_S3_DIRECT_UPLOADS)).toEqual(true);
  });

  it('should return false when user company is not in beta domain list', () => {
    const dao = daoManager.getKVDao(AccountDao);
    dao.put(ACCOUNT_CLIENT_CONFIG, {
      beta_s3_direct_uploads_emails: '123,234,456',
      beta_s3_direct_uploads_domains: '1,2,3,4',
    });

    dao.put(ACCOUNT_USER_ID, 567);
    dao.put(ACCOUNT_COMPANY_ID, 9);

    expect(isInBeta(EBETA_FLAG.BETA_S3_DIRECT_UPLOADS)).toEqual(false);
  });
});
