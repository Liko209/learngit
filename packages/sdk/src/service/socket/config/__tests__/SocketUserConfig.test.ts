/*
 * @Author: kasni.huang (kasni.huang@ringcentral.com)
 * @Date: 2019-03-12 13:52:33
 * Copyright © RingCentral. All rights reserved.
 */

import { SocketUserConfig } from '../SocketUserConfig';
import { AccountGlobalConfig } from '../../../../service/account/config';
import { UserConfigService } from '../../../../module/config/service/UserConfigService';
import { SOCKET_CONFIG_KEYS } from '../configKeys';

jest.mock('../../../../module/config/service/UserConfigService');
jest.mock('../../../../service/account/config');

function clearMocks() {
  jest.clearAllMocks();
  jest.resetAllMocks();
  jest.restoreAllMocks();
}

describe('SocketUserConfig', () => {
  let socketUserConfig: SocketUserConfig;
  let userConfigService: UserConfigService;
  function setUp() {
    userConfigService = new UserConfigService();
    userConfigService.setUserId = jest.fn();
    UserConfigService.getInstance = jest
      .fn()
      .mockReturnValue(userConfigService);

    AccountGlobalConfig.getCurrentUserId = jest.fn().mockReturnValue(222);
    socketUserConfig = new SocketUserConfig();
  }

  beforeEach(() => {
    clearMocks();
    setUp();
  });

  describe('SOCKET_CONFIG_KEYS.SOCKET_SERVER_HOST', () => {
    beforeEach(() => {
      clearMocks();
      setUp();
    });

    it('setSocketServerHost', () => {
      const data: any = {};
      socketUserConfig.setSocketServerHost([data]);
      expect(userConfigService.put).toBeCalledWith(
        'socket',
        SOCKET_CONFIG_KEYS.SOCKET_SERVER_HOST,
        [data],
      );
    });

    it('getSocketServerHost', () => {
      const data: any = [{}];
      userConfigService.get = jest.fn().mockImplementation(() => {
        return data;
      });
      const res = socketUserConfig.getSocketServerHost();
      expect(res).toEqual(data);
    });
  });
});
