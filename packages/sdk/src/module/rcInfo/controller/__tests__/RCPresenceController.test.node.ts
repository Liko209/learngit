/*
 * @Author: Thomas Yang(thomas.yang@ringcentral.com)
 * @Date: 2019-07-24 08:47:38
 * Copyright © RingCentral. All rights reserved.
 */

import { RCInfoApi } from 'sdk/api/ringcentral';
import { RCPresenceController } from '../RCPresenceController';
import { notificationCenter, SERVICE, WINDOW } from 'sdk/service';
import { TelephonyService } from 'sdk/module/telephony';
import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';
import { RCPermissionController } from '../RCPermissionController';
import { ERCServiceFeaturePermission } from '../../types';

jest.mock('sdk/service');
jest.mock('sdk/api/ringcentral');
jest.mock('sdk/module/telephony');
jest.mock('../RCPermissionController');

function clearMocks() {
  jest.clearAllMocks();
  jest.resetAllMocks();
  jest.restoreAllMocks();
}

describe('RCPresenceController', () => {
  let telephonyService: TelephonyService;
  let rcPermissionController: RCPermissionController;
  let rcPresenceController: RCPresenceController;
  function setUp() {
    rcPermissionController = new RCPermissionController(
      null as any,
      null as any,
    );
    rcPermissionController.isRCFeaturePermissionEnabled = jest
      .fn()
      .mockResolvedValue(true);
    telephonyService = new TelephonyService();
    rcPresenceController = new RCPresenceController(rcPermissionController);

    ServiceLoader.getInstance = jest.fn().mockImplementation(x => {
      switch (x) {
        case ServiceConfig.TELEPHONY_SERVICE:
          return telephonyService;
        default:
          return null;
      }
    });
  }
  beforeEach(() => {
    clearMocks();
    setUp();
  });

  describe('start', () => {
    it('should subscribe some notification when start [JPT-2574]', async () => {
      await rcPresenceController.start();
      expect(notificationCenter.on).toHaveBeenCalledWith(
        WINDOW.ONLINE,
        rcPresenceController.syncRCPresence,
      );
      expect(notificationCenter.on).toHaveBeenCalledWith(
        SERVICE.WAKE_UP_FROM_SLEEP,
        rcPresenceController.syncRCPresence,
      );
    });
  });

  describe('syncRCPresence', () => {
    it('should send api to sync rc presence and update switch call', async (done: any) => {
      const data = { id: 1 };
      RCInfoApi.getRCPresence = jest.fn().mockResolvedValue(data);
      rcPresenceController.syncRCPresence();

      setTimeout(() => {
        expect(RCInfoApi.getRCPresence).toHaveBeenCalledTimes(1);
        expect(telephonyService.handleRCPresence).toHaveBeenCalledWith(
          data,
          false,
        );
        done();
      });
    });

    it('should not sync rc presence when user has no voip permission', async (done: any) => {
      rcPermissionController.isRCFeaturePermissionEnabled = jest
        .fn()
        .mockImplementation((x: any) => {
          return ERCServiceFeaturePermission.VOIP_CALLING !== x;
        });
      const data = { id: 1 };
      RCInfoApi.getRCPresence = jest.fn().mockResolvedValue(data);
      rcPresenceController.syncRCPresence();

      setTimeout(() => {
        expect(RCInfoApi.getRCPresence).not.toHaveBeenCalled();
        expect(telephonyService.handleRCPresence).not.toHaveBeenCalledWith(
          data,
          false,
        );
        done();
      });
    });

    it('should not sync rc presence when user has no rc presence permission', async (done: any) => {
      rcPermissionController.isRCFeaturePermissionEnabled = jest
        .fn()
        .mockImplementation((x: any) => {
          return ERCServiceFeaturePermission.RC_PRESENCE !== x;
        });
      const data = { id: 1 };
      RCInfoApi.getRCPresence = jest.fn().mockResolvedValue(data);
      rcPresenceController.syncRCPresence();

      setTimeout(() => {
        expect(RCInfoApi.getRCPresence).not.toHaveBeenCalled();
        expect(telephonyService.handleRCPresence).not.toHaveBeenCalledWith(
          data,
          false,
        );
        done();
      });
    });
  });

  describe('dispose', () => {
    it('should off notification when dispose', () => {
      rcPresenceController.dispose();
      expect(notificationCenter.off).toHaveBeenCalledWith(
        WINDOW.ONLINE,
        rcPresenceController.syncRCPresence,
      );
      expect(notificationCenter.off).toHaveBeenCalledWith(
        SERVICE.WAKE_UP_FROM_SLEEP,
        rcPresenceController.syncRCPresence,
      );
    });
  });
});
