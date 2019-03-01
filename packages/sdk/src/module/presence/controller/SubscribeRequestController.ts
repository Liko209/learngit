/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-09-05 10:05:18
 * Copyright © RingCentral. All rights reserved.
 */

import PresenceAPI from '../../../api/glip/presence';
import socketManager from '../../../service/socket';

class SubscribeRequestController {
  constructor(
    public successCallback: Function,
    public failCallback: Function,
  ) {}

  async execute(ids: number[]) {
    if (ids.length === 0) return;
    if (!socketManager.isConnected()) return;

    try {
      const data = await PresenceAPI.requestPresenceByIds(ids);
      this.successCallback(data);
    } catch (err) {
      this.failCallback(ids);
      return;
    }
  }
}

export { SubscribeRequestController };
