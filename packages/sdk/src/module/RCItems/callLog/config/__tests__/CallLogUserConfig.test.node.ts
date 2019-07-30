/*
 * @Author: Rito.Xiao (rito.xiao@ringcentral.com)
 * @Date: 2019-06-05 13:01:00
 * Copyright © RingCentral. All rights reserved.
 */

import { CallLogUserConfig } from '../CallLogUserConfig';
import { DBConfigService } from 'sdk/module/config/service/DBConfigService';
import { ServiceLoader } from 'sdk/module/serviceLoader';
import { CALL_LOG_CONFIG_KEYS } from '../../constants';
import { daoManager } from 'sdk/dao';

jest.mock('sdk/dao');
jest.mock('sdk/module/config/service/DBConfigService');
jest.mock('sdk/module/serviceLoader');

function clearMocks() {
  jest.clearAllMocks();
  jest.resetAllMocks();
  jest.restoreAllMocks();
}

describe('CallLogUserConfig', () => {
  const MODULE_NAME = 'CallLog';
  let callLogUserConfig: CallLogUserConfig;
  let dbConfigService: DBConfigService;
  function setUp() {
    dbConfigService = new DBConfigService();
    ServiceLoader.getInstance = jest.fn().mockReturnValue(dbConfigService);
    callLogUserConfig = new CallLogUserConfig(MODULE_NAME);
  }

  beforeEach(() => {
    clearMocks();
    setUp();
  });

  describe('CALL_LOG_CONFIG_KEYS.PSEUDO_CALL_LOG_INFO', () => {
    it('setPseudoCallLogInfo', async () => {
      await callLogUserConfig.setPseudoCallLogInfo('info' as any);
      expect(dbConfigService.put).toBeCalledWith(
        MODULE_NAME,
        CALL_LOG_CONFIG_KEYS.PSEUDO_CALL_LOG_INFO,
        'info',
      );
    });

    it('getPseudoCallLogInfo', async () => {
      await callLogUserConfig.getPseudoCallLogInfo();
      expect(dbConfigService.get).toBeCalledWith(
        MODULE_NAME,
        CALL_LOG_CONFIG_KEYS.PSEUDO_CALL_LOG_INFO,
      );
    });
  });
});
