/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-09-05 10:05:18
 * Copyright © RingCentral. All rights reserved.
 */
import PresenceAPI from '../../api/glip/presence';
import socketManager from '../SocketManager';

class SubscribeWorker {
  constructor(
    public successCallback: Function,
    public failCallback: Function,
  ) {}

  async execute(ids: number[]) {
    if (ids.length === 0) return;
    if (!socketManager.isConnected()) return;

    let requestResult;
    try {
      requestResult = await PresenceAPI.requestPresenceByIds(ids);
    } catch (err) {
      this.failCallback(ids);
      return;
    }
    const { data } = requestResult;

    this.successCallback(data);
  }
}

export default SubscribeWorker;
