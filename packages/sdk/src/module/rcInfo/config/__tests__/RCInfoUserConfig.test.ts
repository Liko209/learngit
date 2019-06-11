/*
 * @Author: Thomas Yang(thomas.yang@ringcentral.com)
 * @Date: 2019-06-11 16:58:35
 * Copyright © RingCentral. All rights reserved.
 */

import { DBConfigService } from '../../../config/service/DBConfigService';
import { RCInfoUserConfig } from '../RCInfoUserConfig';
import { ServiceLoader } from 'sdk/module/serviceLoader';
import { MODULE_NAME, RC_INFO_KEYS } from '../constants';

function clearMocks() {
  jest.clearAllMocks();
  jest.resetAllMocks();
  jest.restoreAllMocks();
}

jest.mock('../../../config/service/DBConfigService');
jest.mock('../../../../module/account/config');

describe('RCInfoUserConfig', () => {
  let rcInfoUserConfig: RCInfoUserConfig;
  let dbConfigService: DBConfigService;
  function setUp() {
    dbConfigService = new DBConfigService();
    ServiceLoader.getInstance = jest.fn().mockReturnValue(dbConfigService);

    rcInfoUserConfig = new RCInfoUserConfig();
  }
  beforeEach(() => {
    clearMocks();
    setUp();
  });

  describe.each([
    [
      RC_INFO_KEYS.EXTENSION_INFO,
      { getName: 'getExtensionInfo', setName: 'setExtensionInfo' } as any,
    ],
    [
      RC_INFO_KEYS.ACCOUNT_INFO,
      { getName: 'getAccountInfo', setName: 'setAccountInfo' } as any,
    ],
    [
      RC_INFO_KEYS.CLIENT_INFO,
      { getName: 'getClientInfo', setName: 'setClientInfo' } as any,
    ],
    [
      RC_INFO_KEYS.ROLE_PERMISSIONS,
      { getName: 'getRolePermissions', setName: 'setRolePermissions' } as any,
    ],
    [
      RC_INFO_KEYS.SPECIAL_NUMBER_RULE,
      {
        getName: 'getSpecialNumberRules',
        setName: 'setSpecialNumberRules',
      } as any,
    ],
    [
      RC_INFO_KEYS.PHONE_DATA,
      {
        getName: 'getPhoneData',
        setName: 'setPhoneData',
      } as any,
    ],
    [
      RC_INFO_KEYS.PHONE_DATA_VERSION,
      {
        getName: 'getPhoneDataVersion',
        setName: 'setPhoneDataVersion',
      } as any,
    ],
    [
      RC_INFO_KEYS.EXTENSION_PHONE_NUMBER_LIST,
      {
        getName: 'getExtensionPhoneNumberList',
        setName: 'setExtensionPhoneNumberList',
      } as any,
    ],
    [
      RC_INFO_KEYS.DIALING_PLAN,
      {
        getName: 'getDialingPlan',
        setName: 'setDialingPlan',
      } as any,
    ],
    [
      RC_INFO_KEYS.ACCOUNT_SERVICE_INFO,
      {
        getName: 'getAccountServiceInfo',
        setName: 'setAccountServiceInfo',
      } as any,
    ],
    [
      RC_INFO_KEYS.FORWARDING_NUMBERS,
      {
        getName: 'getForwardingNumbers',
        setName: 'setForwardingNumbers',
      } as any,
    ],
  ])(' %s ', async (key: string, { getName, setName }: any) => {
    it('should set right data', async () => {
      const data: any = {};
      await rcInfoUserConfig[setName](data);
      expect(dbConfigService.put).toBeCalledWith(MODULE_NAME, key, data);
    });

    it('should get right data', async () => {
      const data: any = [{}];
      dbConfigService.get = jest.fn().mockImplementation(() => {
        return data;
      });
      const res = await rcInfoUserConfig[getName]();
      expect(res).toEqual(data);
    });
  });
});
