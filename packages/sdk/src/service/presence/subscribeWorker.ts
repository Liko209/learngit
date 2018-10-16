/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-09-05 10:05:18
 * Copyright © RingCentral. All rights reserved.
 */
import PresenceAPI from '../../api/glip/presence';
import socketManager from '../SocketManager';

class SubscribeWorker {
  public successCallback: Function;
  public failCallback: Function;

  constructor(successCallback: Function, failCallback: Function) {
    this.successCallback = successCallback;
    this.failCallback = failCallback;
  }

  async execute(ids: number[]) {
    if (!socketManager.isConnected()) return;

    try {
      const requestResult = await PresenceAPI.requestPresenceByIds(ids);
      const { data } = requestResult;
      this.successCallback(data);
    } catch (err) {
      this.failCallback(ids);
    }
  }
}

export default SubscribeWorker;
