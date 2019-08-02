/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2019-07-29 15:18:18
 * Copyright © RingCentral. All rights reserved.
 */
import { DataCollectionHelper } from '../DataCollectionHelper';
import { traceData } from 'sdk/api/glip/dataCollection';
import { getCurrentTime } from 'sdk/utils/jsUtils';
import { EnvConfig } from 'sdk/module/env/config';

jest.mock('sdk/api/glip/dataCollection');
jest.mock('sdk/utils/jsUtils');
jest.mock('sdk/module/env/config');

describe('DataCollectionHelper', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    jest.resetAllMocks();
    getCurrentTime.mockReturnValue(1564129259);
  });
  describe('traceLoginFailed', () => {
    it('should trace login failed data', () => {
      EnvConfig.getIsRunningE2E.mockReturnValueOnce(false);
      const controller = new DataCollectionHelper();
      controller.setIsProductionAccount(true);
      controller.traceLoginFailed('rc', 'timeout');
      expect(traceData).toHaveBeenCalledWith({
        event: {
          details: {
            build_type: 'prod',
            error: { code: 'invalid_login', message: 'timeout' },
            feature: 'authentication',
            account_type: 'rc',
          },
          timestamp: 1564129259,
          type: 'failure',
        },
      });
    });

    it('should not called trace data when running e2e', () => {
      EnvConfig.getIsRunningE2E.mockReturnValueOnce(true);
      const controller = new DataCollectionHelper();
      controller.setIsProductionAccount(true);
      controller.traceLoginFailed('rc', 'timeout');
      expect(traceData).not.toHaveBeenCalled();
    });
  });
  describe('traceLoginSuccess', () => {
    it('should trace login success with user info', () => {
      EnvConfig.getIsRunningE2E.mockReturnValueOnce(false);
      const controller = new DataCollectionHelper();
      controller.setIsProductionAccount(true);
      controller.traceLoginSuccess({
        accountType: 'glip',
        userId: 1,
        companyId: 10,
      });
      expect(traceData).toHaveBeenCalledWith({
        event: {
          details: {
            build_type: 'prod',
            company_id: 10,
            feature: 'authentication',
            user_id: 1,
            account_type: 'glip',
          },
          timestamp: 1564129259,
          type: 'success',
        },
      });
    });
  });
});
