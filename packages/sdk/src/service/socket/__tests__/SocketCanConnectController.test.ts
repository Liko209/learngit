/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2019-02-27 16:00:38
 * Copyright © RingCentral. All rights reserved.
 */

import { SocketCanConnectController } from '../SocketCanConnectController';
import { canConnect } from '../../../api/glip/user';
import { PresenceService } from '../../../module/presence/service/PresenceService';
import { AccountUserConfig } from '../../../module/account/config/AccountUserConfig';
import { AuthUserConfig } from '../../../module/account/config/AuthUserConfig';
import { SyncUserConfig } from '../../../module/sync/config/SyncUserConfig';
import { ServiceLoader, ServiceConfig } from '../../../module/serviceLoader';

jest.mock('../../../api/glip/user');
jest.mock('../../../module/presence/service/PresenceService');
jest.mock('../../../module/account/config/AccountUserConfig');
jest.mock('../../../module/account/config/AuthUserConfig');
jest.mock('../../../module/sync/config/SyncUserConfig');

let presenceService;

describe('SocketCanConnectController', () => {
  function clearAndSetupBasicMock() {
    jest.clearAllMocks();
    jest.resetAllMocks();
    presenceService = new PresenceService();
    ServiceLoader.getInstance = jest
      .fn()
      .mockImplementation((config: string) => {
        if (config === ServiceConfig.PRESENCE_SERVICE) {
          return presenceService;
        }
        if (config === ServiceConfig.ACCOUNT_SERVICE) {
          return {
            userConfig: AccountUserConfig.prototype,
            authUserConfig: AuthUserConfig.prototype,
          };
        }
        if (config === ServiceConfig.SYNC_SERVICE) {
          return { userConfig: SyncUserConfig.prototype };
        }
      });
  }

  function getController() {
    return new SocketCanConnectController(1);
  }

  describe('doCanConnectApi', () => {
    beforeEach(() => {
      clearAndSetupBasicMock();
    });
    it('should call _handleReconnectSuccess when get can connect success', async () => {
      const controller = getController();
      jest.spyOn(controller, '_requestCanConnectInfo').mockResolvedValueOnce();
      jest.spyOn(controller, '_onCanConnectApiSuccess').mockResolvedValueOnce();
      const callback = () => {};
      await controller.doCanConnectApi(callback, true);
      expect(controller._onCanConnectApiSuccess).toHaveBeenCalledTimes(1);
    });
    it('should call _onCanConnectApiFailure when get can connect fail', async () => {
      const controller = getController();
      jest.spyOn(controller, '_requestCanConnectInfo').mockRejectedValueOnce();
      jest.spyOn(controller, '_onCanConnectApiFailure').mockResolvedValueOnce();
      await controller.doCanConnectApi(() => {}, true);
      expect(controller._onCanConnectApiFailure).toHaveBeenCalledTimes(1);
    });
  });
  describe('_onCanConnectApiSuccess', () => {
    it('should call _tryToCheckCanConnectAfterTime if the result has reconnect_retry_in', async () => {
      const controller = getController();
      jest
        .spyOn(controller, '_tryToCheckCanConnectAfterTime')
        .mockResolvedValueOnce();
      const callback = () => {};
      await controller._onCanConnectApiSuccess(
        callback,
        { reconnect_retry_in: 1000 },
        false,
      );
      expect(controller._tryToCheckCanConnectAfterTime).toHaveBeenCalledWith(
        callback,
        false,
        1000,
      );
    });
    it('should save scoreboard and call callback if the result has not reconnect_retry_in', async () => {
      const controller = getController();
      let called = false;
      const callback = (id: number) => {
        called = true;
      };
      await controller._onCanConnectApiSuccess(
        callback,
        { scoreboard: 'url' },
        false,
      );
      expect(called).toBeTruthy();
    });
  });

  describe('_onCanConnectApiFailure', () => {
    it('should double reconnect interval time if it less than 1 min', async () => {
      const controller = getController();
      jest
        .spyOn(controller, '_tryToCheckCanConnectAfterTime')
        .mockResolvedValueOnce();
      await controller._onCanConnectApiFailure();
      expect(controller._reconnectIntervalTime).toBeLessThan(60 * 1000);
      expect(controller._tryToCheckCanConnectAfterTime).toHaveBeenCalled();
    });
    it('should equal to 1 min if double reconnect interval time is larger or equal to 1 min', async () => {
      const controller = getController();
      controller._reconnectIntervalTime = 500 * 64;
      jest
        .spyOn(controller, '_tryToCheckCanConnectAfterTime')
        .mockResolvedValueOnce();
      await controller._onCanConnectApiFailure();
      expect(controller._reconnectIntervalTime).toEqual(60 * 1000);
      expect(controller._tryToCheckCanConnectAfterTime).toHaveBeenCalled();
    });
  });

  describe('_requestCanConnectInfo', () => {
    beforeEach(() => {
      clearAndSetupBasicMock();
    });

    function mockData({ user_id, time, token, presence }) {
      AccountUserConfig.prototype.getGlipUserId.mockReturnValueOnce(user_id);
      SyncUserConfig.prototype.getLastIndexTimestamp.mockReturnValueOnce(time);
      AuthUserConfig.prototype.getGlipToken.mockReturnValueOnce(token);
      const controller = getController();
      jest
        .spyOn(controller, '_generateUserPresence')
        .mockReturnValueOnce(presence);
      return controller;
    }

    it('should call canConnect without user_id and newer_than when first time login', async () => {
      const controller = mockData({
        user_id: '',
        time: '',
        token: 'token',
        presence: 'online',
      });
      await controller._requestCanConnectInfo(true);
      expect(canConnect).toHaveBeenCalledWith({
        presence: 'online',
        uidtk: 'token',
      });
    });
    it('should call canConnect with user_id and newer_than when it is not first time login', async () => {
      const controller = mockData({
        user_id: 123,
        time: 1551269156,
        token: 'token',
        presence: 'online',
      });

      await controller._requestCanConnectInfo(true);
      expect(canConnect).toHaveBeenCalledWith({
        user_id: 123,
        newer_than: 1551269156,
        presence: 'online',
        uidtk: 'token',
      });
    });
  });

  describe('_generateUserPresence', () => {
    beforeEach(() => {
      clearAndSetupBasicMock();
    });
    it('should return online when forceOnline', async () => {
      const controller = getController();
      const result = await controller._generateUserPresence(true);
      expect(result).toEqual('online');
    });
    it('should return online when presence is undefined', async () => {
      const controller = getController();
      presenceService.getCurrentUserPresence.mockResolvedValueOnce(undefined);
      const result = await controller._generateUserPresence(false);
      expect(result).toEqual('online');
    });
    it('should return online when presence is NotReady', async () => {
      const controller = getController();
      presenceService.getCurrentUserPresence.mockResolvedValueOnce('NotReady');
      const result = await controller._generateUserPresence(false);
      expect(result).toEqual('online');
    });
    it('should return online when presence is Available', async () => {
      const controller = getController();
      presenceService.getCurrentUserPresence.mockResolvedValueOnce('Available');
      const result = await controller._generateUserPresence(false);
      expect(result).toEqual('online');
    });

    it('should return OnCall when presence is OnCall', async () => {
      const controller = getController();
      presenceService.getCurrentUserPresence.mockResolvedValueOnce('OnCall');
      const result = await controller._generateUserPresence(false);
      expect(result).toEqual('OnCall');
    });
  });
});
