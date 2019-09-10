/*
 * @Author: Rito Xiao (rito.xiao@ringcentral.com)
 * @Date: 2019-08-19 10:52:41
 * Copyright © RingCentral. All rights reserved.
 */

import { VoicemailHandleDataController } from '../VoicemailHandleDataController';
import { MESSAGE_AVAILABILITY } from 'sdk/module/RCItems/constants';
import { notificationCenter } from 'sdk/service';

describe('VoicemailHandleDataController', () => {
  let controller: VoicemailHandleDataController;
  const mockNotificationController = {
    onReceivedNotification: jest.fn(),
  } as any;
  const mockSourceController = {
    update: jest.fn(),
    getEntityNotificationKey: jest.fn(),
  } as any;
  notificationCenter.emitEntityUpdate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
    jest.restoreAllMocks();

    controller = new VoicemailHandleDataController(
      mockNotificationController,
      mockSourceController,
    );
  });

  describe('handleVoicemailEvent', () => {
    it('should call notificationController when voicemail is alive', async () => {
      const data = { availability: MESSAGE_AVAILABILITY.ALIVE } as any;
      await controller.handleVoicemailEvent(data);
      expect(mockSourceController.update).toHaveBeenCalledWith(data);
      expect(notificationCenter.emitEntityUpdate).toHaveBeenCalled();
      expect(
        mockNotificationController.onReceivedNotification,
      ).toHaveBeenCalledWith([data]);
    });

    it('should not call notificationController when voicemail is not alive', async () => {
      const data = { availability: MESSAGE_AVAILABILITY.DELETED } as any;
      await controller.handleVoicemailEvent(data);
      expect(mockSourceController.update).toHaveBeenCalledWith(data);
      expect(notificationCenter.emitEntityUpdate).toHaveBeenCalled();
      expect(
        mockNotificationController.onReceivedNotification,
      ).not.toHaveBeenCalled();
    });
  });
});
