/*
 * @Author: Rito.Xiao (rito.xiao@ringcentral.com)
 * @Date: 2019-05-31 09:19:39
 * Copyright © RingCentral. All rights reserved.
 */

import { CallLogBadgeController } from '../CallLogBadgeController';
import { notificationCenter, EVENT_TYPES, ENTITY } from 'sdk/service';
import { BADGE_STATUS } from 'sdk/module/RCItems/constants';
import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';
import { MISSED_CALL_BADGE_ID, CALL_RESULT } from '../../constants';

describe('CallLogBadgeController', () => {
  let controller: CallLogBadgeController;
  const sourceController = {
    getEntities: jest.fn(),
  } as any;
  const mockBadgeService = { updateBadge: jest.fn(), registerBadge: jest.fn() };
  const mockProfileService = { getProfile: jest.fn() };

  beforeEach(() => {
    ServiceLoader.getInstance = jest
      .fn()
      .mockImplementation((config: string) => {
        if (config === ServiceConfig.BADGE_SERVICE) {
          return mockBadgeService;
        }
        if (config === ServiceConfig.PROFILE_SERVICE) {
          return mockProfileService;
        }
        return;
      });
    controller = new CallLogBadgeController(sourceController);
  });

  describe('init', () => {
    it('should observe callLog update/reload and profile update', () => {
      notificationCenter.on = jest.fn();
      controller.init();
      expect(notificationCenter.on).toHaveBeenCalledTimes(2);
      expect(notificationCenter.on).toHaveBeenCalledWith(
        ENTITY.CALL_LOG,
        controller.handleCallLogPayload,
      );
      expect(notificationCenter.on).toHaveBeenCalledWith(
        ENTITY.PROFILE,
        controller.handleProfile,
      );
    });
  });

  describe('initializeUnreadCount', () => {
    it('should set status as idle when crash', async () => {
      sourceController.getEntities.mockImplementation(() => {
        throw 'err';
      });
      await controller.initializeUnreadCount();
      expect(controller['_badgeStatus']).toEqual(BADGE_STATUS.IDLE);
    });

    it('should init unreadCount correctly', async () => {
      mockProfileService.getProfile.mockReturnValue(1234589);
      const mockData = [{ id: 1 }, { id: 2 }];
      sourceController.getEntities.mockReturnValue(mockData);
      controller['_updateUnreadCount'] = jest.fn();
      controller['_registerBadge'] = jest.fn();
      controller['_updateBadge'] = jest.fn();
      await controller.initializeUnreadCount();
      expect(controller['_updateUnreadCount']).toHaveBeenCalledTimes(2);
      expect(controller['_registerBadge']).toHaveBeenCalled();
      expect(controller['_updateBadge']).toHaveBeenCalled();
      expect(controller['_badgeStatus']).toEqual(BADGE_STATUS.INITIALIZED);
    });
  });

  describe('reset', () => {
    it('should reset correctly', () => {
      controller['_unreadMap'].set('1', 1);
      controller['_badgeStatus'] = BADGE_STATUS.INITIALIZED;
      controller['_lastReadMissed'] = 19;
      controller.reset();
      expect(controller['_unreadMap'].size).toEqual(0);
      expect(controller['_badgeStatus']).toEqual(BADGE_STATUS.IDLE);
      expect(controller['_lastReadMissed']).toBeUndefined();
    });
  });

  describe('handleCallLogReload', () => {
    it('should call reset and init', () => {
      controller.reset = jest.fn();
      controller['_updateBadge'] = jest.fn();
      controller.initializeUnreadCount = jest.fn();
      controller.handleCallLogReload();
      expect(controller.reset).toHaveBeenCalled();
      expect(controller['_updateBadge']).toHaveBeenCalled();
      expect(controller.initializeUnreadCount).toHaveBeenCalled();
    });
  });

  describe('handleCallLogPayload', () => {
    it('should call handleCallLogs when type is update', async () => {
      const mockData = [{ id: '123' }];
      const mockPayload = {
        type: EVENT_TYPES.UPDATE,
        body: { entities: new Map(mockData.map(data => [data.id, data])) },
      } as any;
      controller.handleCallLogs = jest.fn();
      controller.handleCallLogReload = jest.fn();
      await controller.handleCallLogPayload(mockPayload);
      expect(controller.handleCallLogs).toHaveBeenCalledWith(mockData);
      expect(controller.handleCallLogReload).not.toHaveBeenCalled();
    });

    it('should call handleCallLogs when type is reload', async () => {
      const mockPayload = {
        type: EVENT_TYPES.RELOAD,
      } as any;
      controller.handleCallLogs = jest.fn();
      controller.handleCallLogReload = jest.fn();
      await controller.handleCallLogPayload(mockPayload);
      expect(controller.handleCallLogs).not.toHaveBeenCalled();
      expect(controller.handleCallLogReload).toHaveBeenCalled();
    });

    it('should do nothing when type is not update or reload', async () => {
      const mockPayload = {
        type: EVENT_TYPES.DELETE,
      } as any;
      controller.handleCallLogs = jest.fn();
      controller.handleCallLogReload = jest.fn();
      await controller.handleCallLogPayload(mockPayload);
      expect(controller.handleCallLogs).not.toHaveBeenCalled();
      expect(controller.handleCallLogReload).not.toHaveBeenCalled();
    });
  });

  describe('handleProfile', () => {
    it('should handle profile when type is update', async () => {
      const mockData = [{ id: 1, last_read_missed: 100 }];
      const mockPayload = {
        type: EVENT_TYPES.UPDATE,
        body: { entities: new Map(mockData.map(data => [data.id, data])) },
      } as any;
      controller['_badgeStatus'] = BADGE_STATUS.INITIALIZED;
      controller['_updateBadge'] = jest.fn();
      controller['_unreadMap'].set('1', 1);
      controller['_unreadMap'].set('2', 100);
      controller['_unreadMap'].set('2', 101);

      await controller.handleProfile(mockPayload);
      expect(controller['_updateBadge']).toHaveBeenCalled();
      expect(controller['_unreadMap'].size).toEqual(1);
    });
  });

  describe('handleCallLogs', () => {
    it('should do init and handle callLog when status is idle', async () => {
      controller.initializeUnreadCount = jest.fn();
      controller['_updateUnreadCount'] = jest
        .fn()
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(false);
      controller['_updateBadge'] = jest.fn();
      const mockData = [{ id: 1 }, { id: 2 }] as any;

      await controller.handleCallLogs(mockData);
      expect(controller.initializeUnreadCount).toHaveBeenCalled();
      expect(controller['_updateUnreadCount']).toHaveBeenCalledTimes(2);
      expect(controller['_updateBadge']).not.toHaveBeenCalled();
    });

    it('should handle callLog and update badge without init when status is initialized', async () => {
      controller['_badgeStatus'] = BADGE_STATUS.INITIALIZED;
      controller.initializeUnreadCount = jest.fn();
      controller['_updateUnreadCount'] = jest
        .fn()
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(false);
      controller['_updateBadge'] = jest.fn();
      const mockData = [{ id: 1 }, { id: 2 }] as any;

      await controller.handleCallLogs(mockData);
      expect(controller.initializeUnreadCount).not.toHaveBeenCalled();
      expect(controller['_updateUnreadCount']).toHaveBeenCalledTimes(2);
      expect(controller['_updateBadge']).toHaveBeenCalled();
    });

    it('should only handle callLog when status is initializing', async () => {
      controller['_badgeStatus'] = BADGE_STATUS.INITIALIZING;
      controller.initializeUnreadCount = jest.fn();
      controller['_updateUnreadCount'] = jest
        .fn()
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(false);
      controller['_updateBadge'] = jest.fn();
      const mockData = [{ id: 1 }, { id: 2 }] as any;

      await controller.handleCallLogs(mockData);
      expect(controller.initializeUnreadCount).not.toHaveBeenCalled();
      expect(controller['_updateUnreadCount']).toHaveBeenCalledTimes(2);
      expect(controller['_updateBadge']).not.toHaveBeenCalled();
    });
  });

  describe('_updateUnreadCount()', () => {
    it('should not update unread when data is deactivated', async () => {
      controller['_lastReadMissed'] = 100;
      const mockData = {
        id: '1',
        result: CALL_RESULT.MISSED,
        deleted: true,
        __timestamp: 123,
      } as any;
      expect(controller['_updateUnreadCount'](mockData)).toBeFalsy();
      expect(controller['_unreadMap'].size).toEqual(0);
    });

    it('should update unread when this._lastReadMissed < data.__timestamp', async () => {
      controller['_lastReadMissed'] = 100;
      const mockData = {
        id: '1',
        result: CALL_RESULT.MISSED,
        deleted: false,
        __timestamp: 123,
      } as any;
      expect(controller['_updateUnreadCount'](mockData)).toBeTruthy();
      expect(controller['_unreadMap'].size).toEqual(1);
    });

    it('should delete unread when  this._lastReadMissed <= data.__timestamp', async () => {
      controller['_lastReadMissed'] = 100;
      const mockData = {
        id: '1',
        result: CALL_RESULT.MISSED,
        deleted: false,
        __timestamp: 100,
      } as any;
      controller['_unreadMap'].set('1', 16);
      expect(controller['_updateUnreadCount'](mockData)).toBeTruthy();
      expect(controller['_unreadMap'].size).toEqual(0);
    });
  });

  describe('_updateUnreadCount', () => {
    it('should remove unread when call log is deactivated', () => {
      const mockData = {
        result: CALL_RESULT.MISSED,
        deleted: true,
        id: '456',
      } as any;
      controller['_unreadMap'].set('456', 123);
      expect(controller['_updateUnreadCount'](mockData)).toBeTruthy();
      expect(controller['_unreadMap'].size).toEqual(0);
    });
  });

  describe('_updateBadge()', () => {
    it('should call badgeService', () => {
      controller['_unreadMap'].set('1', 1);
      controller['_unreadMap'].set('2', 2);
      controller['_updateBadge']();
      expect(mockBadgeService.updateBadge).toHaveBeenCalledWith({
        id: MISSED_CALL_BADGE_ID,
        unreadCount: 2,
      });
    });
  });

  describe('_registerBadge()', () => {
    it('should register badge', () => {
      controller['_getBadge'] = jest.fn();
      mockBadgeService.registerBadge.mockImplementation(
        (id: string, func: () => any) => {
          func();
        },
      );
      controller['_registerBadge']();
      expect(mockBadgeService.registerBadge).toHaveBeenCalledTimes(1);
    });
  });
});
