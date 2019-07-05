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
import { getSpartaRandomTime } from 'foundation/src/utils/algorithm/SpartaRandomTime';

jest.mock('../../../api/glip/user');
jest.mock('../../../module/presence/service/PresenceService');
jest.mock('../../../module/account/config/AccountUserConfig');
jest.mock('../../../module/account/config/AuthUserConfig');
jest.mock('../../../module/sync/config/SyncUserConfig');
jest.mock('foundation/src/utils/algorithm/SpartaRandomTime');

let presenceService: PresenceService;

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

  describe('_doCanConnectApi', () => {
    beforeEach(() => {
      clearAndSetupBasicMock();
    });
    it('should call _handleReconnectSuccess when get can connect success', async () => {
      const controller = getController();
      jest.spyOn(controller, '_requestCanConnectInfo').mockResolvedValueOnce();
      jest.spyOn(controller, '_onCanConnectApiSuccess').mockResolvedValueOnce();
      const callback = () => {};
      await controller._doCanConnectApi(callback, true);
      expect(controller._onCanConnectApiSuccess).toHaveBeenCalledTimes(1);
    });
    it('should call _onCanConnectApiFailure when get can connect fail', async () => {
      const controller = getController();
      jest.spyOn(controller, '_requestCanConnectInfo').mockRejectedValueOnce();
      jest.spyOn(controller, '_onCanConnectApiFailure').mockResolvedValueOnce();
      await controller._doCanConnectApi(() => {}, true);
      expect(controller._onCanConnectApiFailure).toHaveBeenCalledTimes(1);
    });
    it('should call _onCanConnectApiFailure when get can connect success but with invalid response', async () => {
      const controller = getController();
      jest
        .spyOn(controller, '_requestCanConnectInfo')
        .mockResolvedValueOnce('<html><head></head></html>');
      jest
        .spyOn(controller, '_tryToCheckCanConnectAfterTime')
        .mockResolvedValueOnce();
      jest.spyOn(controller, '_onCanConnectApiFailure').mockResolvedValueOnce();
      const callback = () => {};
      await controller['_doCanConnectApi'](callback, true);
      expect(controller['_onCanConnectApiFailure']).toHaveBeenCalledTimes(1);
    });
    it('should call _tryToCheckCanConnectAfterTime when get can connect response with reconnect_retry_in', async () => {
      const controller = getController();
      jest
        .spyOn(controller, '_requestCanConnectInfo')
        .mockResolvedValueOnce({ reconnect_retry_in: 1 });
      jest
        .spyOn(controller, '_tryToCheckCanConnectAfterTime')
        .mockResolvedValueOnce();
      const callback = () => {};
      await controller['_doCanConnectApi'](callback, true);
      expect(
        controller['_tryToCheckCanConnectAfterTime'],
      ).toHaveBeenCalledTimes(1);
    });
    it('should call callback when everything is good', async (done: any) => {
      const controller = getController();
      jest
        .spyOn(controller, '_requestCanConnectInfo')
        .mockResolvedValueOnce({});
      const callback = jest.fn();
      await controller.doCanConnectApi({
        interval: 33333,
        callback,
        forceOnline: true,
        nthCount: 0,
      });
      setTimeout(() => {
        expect(callback).toHaveBeenCalledTimes(1);
        done();
      }, 100);
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
    it('should retry after SpartaRandomTime', async () => {
      const controller = getController();
      jest
        .spyOn(controller, '_tryToCheckCanConnectAfterTime')
        .mockResolvedValueOnce();
      controller['_retryCount'] = 1;
      const callback = () => {};
      getSpartaRandomTime.mockReturnValueOnce(3);
      await controller['_onCanConnectApiFailure'](null, callback, true);
      expect(getSpartaRandomTime).toHaveBeenCalledWith(2, true);
      expect(controller['_tryToCheckCanConnectAfterTime']).toHaveBeenCalledWith(
        callback,
        true,
        3,
      );
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

  describe('_getStartedTime', () => {
    it('should return 0 when nthCount is 0 and interval is larger than 3000', () => {
      const controller = getController();
      const result = controller['_getStartedTime'](0, 6666);
      expect(result).toEqual(0);
    });
    it('should return sparta random time when nthCount is larger than 1', () => {
      const controller = getController();
      getSpartaRandomTime.mockReturnValueOnce(10000);
      const result = controller['_getStartedTime'](1, 0);
      expect(result).toEqual(10000);
    });
    it('should return 3000 - interval when nthCount is 0 and interval is less than 3000', () => {
      const controller = getController();
      const result = controller['_getStartedTime'](0, 2000);
      expect(result).toEqual(1000);
    });
  });
});
