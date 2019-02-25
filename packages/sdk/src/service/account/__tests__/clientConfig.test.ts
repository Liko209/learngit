/*
 * @Author: Lip Wang (lip.wangn@ringcentral.com)
 * @Date: 2018-03-01 14:02:24
 */

import { EBETA_FLAG, isInBeta } from '../clientConfig';
import { GlobalConfigService } from '../../../module/config';
import { NewGlobalConfig } from '../../../service/config/newGlobalConfig';
import { AccountGlobalConfig } from '../../../service/account/config';

jest.mock('../../../module/config');
jest.mock('../../../service/config/newGlobalConfig');
jest.mock('../../../service/account/config');

GlobalConfigService.getInstance = jest.fn();

describe('Client Config', () => {
  const accConfig = new AccountGlobalConfig(null);
  const newConfig = new NewGlobalConfig(null);

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
    jest.restoreAllMocks();

    NewGlobalConfig.getInstance = jest.fn().mockReturnValue(newConfig);
    AccountGlobalConfig.getInstance = jest.fn().mockReturnValue(accConfig);
  });

  function setS3UploadBeta() {
    newConfig.getClientId = jest.fn().mockReturnValue({
      beta_s3_direct_uploads_emails: '123,234,456',
      beta_s3_direct_uploads_domains: '1,2,3,4',
    });
  }

  it('beta log', async () => {
    newConfig.getClientId = jest.fn().mockReturnValue({
      beta_enable_log_emails: '123,234,456',
      beta_enable_log_domains: '1,2,3,4',
    });
    accConfig.getCurrentUserId = jest.fn().mockReturnValue(123);
    expect(isInBeta(EBETA_FLAG.BETA_LOG)).toEqual(true);

    accConfig.getCurrentUserId = jest.fn().mockReturnValue(10);
    expect(isInBeta(EBETA_FLAG.BETA_LOG)).toEqual(false);

    accConfig.getCurrentCompanyId = jest.fn().mockReturnValue(4);
    expect(isInBeta(EBETA_FLAG.BETA_LOG)).toEqual(true);
  });

  it('should return true when user id is in beta list', () => {
    setS3UploadBeta();

    accConfig.getCurrentUserId = jest.fn().mockReturnValue(123);
    accConfig.getCurrentCompanyId = jest.fn().mockReturnValue(5);

    expect(isInBeta(EBETA_FLAG.BETA_S3_DIRECT_UPLOADS)).toEqual(true);
  });

  it('should return false when user id is not in beta list', () => {
    setS3UploadBeta();

    accConfig.getCurrentUserId = jest.fn().mockReturnValue(123);
    accConfig.getCurrentCompanyId = jest.fn().mockReturnValue(5);

    expect(isInBeta(EBETA_FLAG.BETA_S3_DIRECT_UPLOADS)).toEqual(true);
  });

  it('should return true when user company is in beta domain list', async () => {
    setS3UploadBeta();

    accConfig.getCurrentUserId = jest.fn().mockReturnValue(567);
    accConfig.getCurrentCompanyId = jest.fn().mockReturnValue(3);

    expect(isInBeta(EBETA_FLAG.BETA_S3_DIRECT_UPLOADS)).toEqual(true);
  });

  it('should return false when user company is not in beta domain list', async () => {
    setS3UploadBeta();

    accConfig.getCurrentUserId = jest.fn().mockReturnValue(567);
    accConfig.getCurrentCompanyId = jest.fn().mockReturnValue(9);

    expect(isInBeta(EBETA_FLAG.BETA_S3_DIRECT_UPLOADS)).toEqual(false);
  });

  it('should return true when beta flag is on for all', async () => {
    newConfig.getClientId = jest.fn().mockReturnValue({
      beta_s3_direct_uploads_emails: '123,234,456',
      beta_s3_direct_uploads_domains: '1,2,3,4',
      beta_s3_direct_uploads: 'true',
    });
    accConfig.getCurrentUserId = jest.fn().mockReturnValue(567);
    accConfig.getCurrentCompanyId = jest.fn().mockReturnValue(9);

    expect(isInBeta(EBETA_FLAG.BETA_S3_DIRECT_UPLOADS)).toEqual(true);
  });
});
