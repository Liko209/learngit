/*
 * @Author: Lip Wang (lip.wangn@ringcentral.com)
 * @Date: 2018-03-01 14:02:24
 */

import { EBETA_FLAG, isInBeta } from '../clientConfig';
import { GlobalConfigService } from '../../../module/config';
import { AccountUserConfig } from '../../../service/account/config';

jest.mock('../../../module/config');
jest.mock('../../../service/account/config');

GlobalConfigService.getInstance = jest.fn();

describe('Client Config', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  function setS3UploadBeta() {
    AccountUserConfig.prototype.getClientConfig = jest.fn().mockReturnValue({
      beta_s3_direct_uploads_emails: '123,234,456',
      beta_s3_direct_uploads_domains: '1,2,3,4',
    });
  }

  it('beta log', async () => {
    AccountUserConfig.prototype.getClientConfig = jest.fn().mockReturnValue({
      beta_enable_log_emails: '123,234,456',
      beta_enable_log_domains: '1,2,3,4',
    });
    AccountUserConfig.prototype.getGlipUserId = jest.fn().mockReturnValue(123);
    expect(isInBeta(EBETA_FLAG.BETA_LOG)).toEqual(true);

    AccountUserConfig.prototype.getGlipUserId = jest.fn().mockReturnValue(10);
    expect(isInBeta(EBETA_FLAG.BETA_LOG)).toEqual(false);

    AccountUserConfig.prototype.getCurrentCompanyId = jest
      .fn()
      .mockReturnValue(4);
    expect(isInBeta(EBETA_FLAG.BETA_LOG)).toEqual(true);
  });

  it('should return true when user id is in beta list', () => {
    setS3UploadBeta();

    AccountUserConfig.prototype.getGlipUserId = jest.fn().mockReturnValue(123);
    AccountUserConfig.prototype.getCurrentCompanyId = jest
      .fn()
      .mockReturnValue(5);

    expect(isInBeta(EBETA_FLAG.BETA_S3_DIRECT_UPLOADS)).toEqual(true);
  });

  it('should return false when user id is not in beta list', () => {
    setS3UploadBeta();

    AccountUserConfig.prototype.getGlipUserId = jest.fn().mockReturnValue(123);
    AccountUserConfig.prototype.getCurrentCompanyId = jest
      .fn()
      .mockReturnValue(5);

    expect(isInBeta(EBETA_FLAG.BETA_S3_DIRECT_UPLOADS)).toEqual(true);
  });

  it('should return true when user company is in beta domain list', async () => {
    setS3UploadBeta();

    AccountUserConfig.prototype.getGlipUserId = jest.fn().mockReturnValue(567);
    AccountUserConfig.prototype.getCurrentCompanyId = jest
      .fn()
      .mockReturnValue(3);

    expect(isInBeta(EBETA_FLAG.BETA_S3_DIRECT_UPLOADS)).toEqual(true);
  });

  it('should return false when user company is not in beta domain list', async () => {
    setS3UploadBeta();

    AccountUserConfig.prototype.getGlipUserId = jest.fn().mockReturnValue(567);
    AccountUserConfig.prototype.getCurrentCompanyId = jest
      .fn()
      .mockReturnValue(9);

    expect(isInBeta(EBETA_FLAG.BETA_S3_DIRECT_UPLOADS)).toEqual(false);
  });

  it('should return true when beta flag is on for all', async () => {
    AccountUserConfig.prototype.getClientConfig = jest.fn().mockReturnValue({
      beta_s3_direct_uploads_emails: '123,234,456',
      beta_s3_direct_uploads_domains: '1,2,3,4',
      beta_s3_direct_uploads: 'true',
    });
    AccountUserConfig.prototype.getGlipUserId = jest.fn().mockReturnValue(567);
    AccountUserConfig.prototype.getCurrentCompanyId = jest
      .fn()
      .mockReturnValue(9);

    expect(isInBeta(EBETA_FLAG.BETA_S3_DIRECT_UPLOADS)).toEqual(true);
  });
});
