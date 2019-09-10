/*
 * @Author: Paynter Chen
 * @Date: 2019-08-20 17:02:32
 * Copyright © RingCentral. All rights reserved.
 */

import { LogGlobalConfig } from '../config/LogGlobalConfig';
import { getClientId } from '../utils';

jest.mock('../config/LogGlobalConfig');
describe('utils', () => {
  describe('getClientId', () => {
    const MOCK_CLIENT_ID = 'mock-client-id';
    beforeEach(() => {
      jest.clearAllMocks();
      jest.resetModules();
      jest.restoreAllMocks();
    });
    it('should setClientId firstTime', () => {
      console.log(getClientId['clientId']);
      const clientId = getClientId(true);
      expect(LogGlobalConfig.getClientId).toHaveBeenCalledTimes(1);
      expect(LogGlobalConfig.setClientId).toHaveBeenCalledTimes(1);
    });
    it('should getClientId from LogGlobalConfig', () => {
      LogGlobalConfig.getClientId.mockReturnValue(MOCK_CLIENT_ID);
      const clientId = getClientId(true);
      expect(LogGlobalConfig.getClientId).toHaveBeenCalledTimes(2);
      expect(LogGlobalConfig.setClientId).not.toHaveBeenCalled();
      expect(clientId).toEqual(MOCK_CLIENT_ID);
    });
    it('should getClientId from cache', () => {
      const clientId = getClientId();
      expect(LogGlobalConfig.getClientId).not.toHaveBeenCalled();
      expect(LogGlobalConfig.setClientId).not.toHaveBeenCalled();
      expect(clientId).toEqual(MOCK_CLIENT_ID);
    });
  });
});
