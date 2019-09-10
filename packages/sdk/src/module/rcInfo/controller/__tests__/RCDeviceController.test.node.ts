/*
 * @Author: Lewi Li (lewi.li@ringcentral.com)
 * @Date: 2019-07-29 09:27:02
 * Copyright © RingCentral. All rights reserved.
 */

import { RCInfoApi } from 'sdk/api/ringcentral';
import { RCDeviceController } from '../RCDeviceController';

describe('RCDeviceController', () => {
  let deviceController: RCDeviceController;
  const deviceId = '1';

  beforeEach(() => {
    deviceController = new RCDeviceController();
  });

  describe('assignLine', () => {
    it('should be called with correct params', () => {
      RCInfoApi.assignLine = jest.fn();
      deviceController.assignLine(deviceId, 'test');
      expect(RCInfoApi.assignLine).toHaveBeenCalledWith(deviceId, 'test');
    });
  });

  describe('updateLine', () => {
    it('should be called with correct params', () => {
      RCInfoApi.updateLine = jest.fn();
      deviceController.updateLine(deviceId, 'test');
      expect(RCInfoApi.updateLine).toHaveBeenCalledWith(deviceId, 'test');
    });
  });
});
