/*
 * @Author: Thomas Yang(thomas.yang@ringcentral.com)
 * @Date: 2019-07-24 08:47:38
 * Copyright © RingCentral. All rights reserved.
 */

import { RCInfoApi } from 'sdk/api/ringcentral';
import { RCPresenceController } from '../RCPresenceController';
import { notificationCenter, RC_INFO } from 'sdk/service';
import { RCPermissionController } from '../RCPermissionController';
import { ERCServiceFeaturePermission } from '../../types';

jest.mock('sdk/service');
jest.mock('sdk/api/ringcentral');
jest.mock('../RCPermissionController');
jest.mock('sdk/service');

function clearMocks() {
  jest.clearAllMocks();
  jest.resetAllMocks();
  jest.restoreAllMocks();
}

describe('RCPresenceController', () => {
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
    rcPresenceController = new RCPresenceController(rcPermissionController);
  }
  beforeEach(() => {
    clearMocks();
    setUp();
  });

  describe('syncRCPresence', () => {
    it('should send api to sync rc presence and update switch call', async (done: any) => {
      const data = { id: 1 };
      RCInfoApi.getRCPresence = jest.fn().mockResolvedValue(data);
      rcPresenceController.syncRCPresence();

      setTimeout(() => {
        expect(RCInfoApi.getRCPresence).toHaveBeenCalledTimes(1);
        expect(notificationCenter.emitKVChange).toHaveBeenCalledWith(
          RC_INFO.RC_PRESENCE,
          data,
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
        expect(notificationCenter.emitKVChange).not.toHaveBeenCalledWith(
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
        expect(notificationCenter.emitKVChange).not.toHaveBeenCalledWith(
          data,
          false,
        );
        done();
      });
    });
  });

  describe('dispose', () => {
    it('should off notification when dispose', () => {
      const testFn = jest.fn();
      rcPresenceController['_getQueueHandler'] = jest.fn().mockReturnValue({
        clear: testFn,
      });
      rcPresenceController.dispose();
      expect(testFn).toHaveBeenCalled();
    });
  });
});
