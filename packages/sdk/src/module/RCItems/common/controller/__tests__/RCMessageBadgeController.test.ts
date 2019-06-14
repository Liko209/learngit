/*
 * @Author: Rito.Xiao (rito.xiao@ringcentral.com)
 * @Date: 2019-05-31 09:19:39
 * Copyright © RingCentral. All rights reserved.
 */

import { RCMessageBadgeController } from '../RCMessageBadgeController';
import { RCMessage } from 'sdk/module/RCItems/types';
import { notificationCenter, EVENT_TYPES } from 'sdk/service';
import {
  BADGE_STATUS,
  MESSAGE_AVAILABILITY,
  READ_STATUS,
} from 'sdk/module/RCItems/constants';
import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';

describe('RCMessageBadgeController', () => {
  let controller: RCMessageBadgeController<RCMessage>;
  const sourceController = {
    getEntities: jest.fn(),
  } as any;
  const mockBadgeService = { updateBadge: jest.fn(), registerBadge: jest.fn() };

  beforeEach(() => {
    ServiceLoader.getInstance = jest
      .fn()
      .mockImplementation((config: string) => {
        if (config === ServiceConfig.BADGE_SERVICE) {
          return mockBadgeService;
        }
        return;
      });
    controller = new RCMessageBadgeController(
      'entity',
      'badgeId',
      sourceController,
    );
  });

  describe('init', () => {
    it('should observe RC message update and reload', () => {
      notificationCenter.on = jest.fn();
      controller.init();
      expect(notificationCenter.on).toBeCalledTimes(1);
      expect(notificationCenter.on).toHaveBeenCalledWith(
        'entity',
        controller.handleVoicemailPayload,
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
      const mockData = [
        {
          id: 1,
          availability: MESSAGE_AVAILABILITY.DELETED,
          readStatus: READ_STATUS.UNREAD,
        },
        {
          id: 2,
          availability: MESSAGE_AVAILABILITY.ALIVE,
          readStatus: READ_STATUS.UNREAD,
        },
        {
          id: 3,
          availability: MESSAGE_AVAILABILITY.ALIVE,
          readStatus: READ_STATUS.READ,
        },
        {
          id: 4,
          availability: MESSAGE_AVAILABILITY.ALIVE,
          readStatus: READ_STATUS.UNREAD,
        },
      ];
      sourceController.getEntities.mockReturnValue(mockData);
      controller['_unreadMap'].set(2, false);
      controller['_registerBadge'] = jest.fn();
      controller['_updateBadge'] = jest.fn();
      await controller.initializeUnreadCount();
      expect(controller['_unreadCount']).toEqual(1);
      expect(controller['_unreadMap'].size).toEqual(3);
      expect(controller['_registerBadge']).toBeCalled();
      expect(controller['_updateBadge']).toBeCalled();
      expect(controller['_badgeStatus']).toEqual(BADGE_STATUS.INITIALIZED);
    });
  });

  describe('reset', () => {
    it('should reset correctly', () => {
      controller['_unreadMap'].set(1, true);
      controller['_badgeStatus'] = BADGE_STATUS.INITIALIZED;
      controller['_unreadCount'] = 19;
      controller.reset();
      expect(controller['_unreadMap'].size).toEqual(0);
      expect(controller['_badgeStatus']).toEqual(BADGE_STATUS.IDLE);
      expect(controller['_unreadCount']).toEqual(0);
    });
  });

  describe('handleVoicemailReload', () => {
    it('should call reset and init', () => {
      controller.reset = jest.fn();
      controller['_updateBadge'] = jest.fn();
      controller.initializeUnreadCount = jest.fn();
      controller.handleVoicemailReload();
      expect(controller.reset).toBeCalled();
      expect(controller['_updateBadge']).toBeCalled();
      expect(controller.initializeUnreadCount).toBeCalled();
    });
  });

  describe('handleVoicemailPayload', () => {
    it('should call handleVoicemails when type is update', async () => {
      const mockData = [{ id: 123 }];
      const mockPayload = {
        type: EVENT_TYPES.UPDATE,
        body: { entities: new Map(mockData.map(data => [data.id, data])) },
      } as any;
      controller.handleVoicemails = jest.fn();
      await controller.handleVoicemailPayload(mockPayload);
      expect(controller.handleVoicemails).toBeCalledWith(mockData);
    });

    it('should do nothing when type is not update', async () => {
      const mockPayload = {
        type: EVENT_TYPES.DELETE,
      } as any;
      controller.handleVoicemails = jest.fn();
      await controller.handleVoicemailPayload(mockPayload);
      expect(controller.handleVoicemails).not.toBeCalled();
    });
  });

  describe('handleVoicemails', () => {
    it('should do init and handle voicemail when status is idle', async () => {
      controller.initializeUnreadCount = jest.fn();
      controller['_updateBadge'] = jest.fn();
      const mockData = [
        {
          id: 1,
          availability: MESSAGE_AVAILABILITY.ALIVE,
          readStatus: READ_STATUS.UNREAD,
        },
      ] as any;

      await controller.handleVoicemails(mockData);
      expect(controller.initializeUnreadCount).toBeCalled();
      expect(controller['_updateBadge']).not.toBeCalled();
      expect(controller['_unreadCount']).toEqual(1);
      expect(controller['_unreadMap'].size).toEqual(1);
    });

    it('should handle voicemail and update badge without init when status is initialized', async () => {
      controller['_badgeStatus'] = BADGE_STATUS.INITIALIZED;
      controller.initializeUnreadCount = jest.fn();
      controller['_updateBadge'] = jest.fn();
      const mockData = [
        {
          id: 1,
          availability: MESSAGE_AVAILABILITY.ALIVE,
          readStatus: READ_STATUS.UNREAD,
        },
      ] as any;

      await controller.handleVoicemails(mockData);
      expect(controller.initializeUnreadCount).not.toBeCalled();
      expect(controller['_updateBadge']).toBeCalled();
      expect(controller['_unreadCount']).toEqual(1);
      expect(controller['_unreadMap'].size).toEqual(1);
    });

    it('should only handle voicemail when status is initializing', async () => {
      controller['_badgeStatus'] = BADGE_STATUS.INITIALIZING;
      controller.initializeUnreadCount = jest.fn();
      controller['_updateBadge'] = jest.fn();
      const mockData = [
        {
          id: 1,
          availability: MESSAGE_AVAILABILITY.DELETED,
          readStatus: READ_STATUS.READ,
        },
        {
          id: 2,
          availability: MESSAGE_AVAILABILITY.DELETED,
          readStatus: READ_STATUS.UNREAD,
        },
        {
          id: 3,
          availability: MESSAGE_AVAILABILITY.DELETED,
          readStatus: READ_STATUS.READ,
        },
        {
          id: 4,
          availability: MESSAGE_AVAILABILITY.ALIVE,
          readStatus: READ_STATUS.READ,
        },
        {
          id: 5,
          availability: MESSAGE_AVAILABILITY.ALIVE,
          readStatus: READ_STATUS.UNREAD,
        },
        {
          id: 6,
          availability: MESSAGE_AVAILABILITY.ALIVE,
          readStatus: READ_STATUS.READ,
        },
      ] as any;
      controller['_unreadMap'].set(2, true);
      controller['_unreadMap'].set(3, false);
      controller['_unreadMap'].set(6, true);

      await controller.handleVoicemails(mockData);
      expect(controller.initializeUnreadCount).not.toBeCalled();
      expect(controller['_updateBadge']).not.toBeCalled();
      expect(controller['_unreadCount']).toEqual(0);
      expect(controller['_unreadMap'].size).toEqual(2);
    });
  });

  describe('_updateBadge()', () => {
    it('should call badgeService', () => {
      controller['_unreadCount'] = 123;
      controller['_updateBadge']();
      expect(mockBadgeService.updateBadge).toBeCalledWith({
        id: 'badgeId',
        unreadCount: 123,
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
      expect(mockBadgeService.registerBadge).toBeCalledTimes(1);
    });
  });
});
