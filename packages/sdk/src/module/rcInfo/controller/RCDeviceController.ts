/*
 * @Author: Lewi Li (lewi.li@ringcentral.com)
 * @Date: 2019-07-25 10:50:09
 * Copyright © RingCentral. All rights reserved.
 */
import { IAssignLineRequest, IUpdateLineRequest } from '../types';
import { RCInfoApi } from 'sdk/api/ringcentral';

class RCDeviceController {
  async assignLine(deviceId: string, data: IAssignLineRequest) {
    await RCInfoApi.assignLine(deviceId, data);
  }

  async updateLine(deviceId: string, data: IUpdateLineRequest) {
    await RCInfoApi.updateLine(deviceId, data);
  }
}

export { RCDeviceController };
