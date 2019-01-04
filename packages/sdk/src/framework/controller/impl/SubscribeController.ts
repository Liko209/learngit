/*
 * @Author: Thomas thomas.yang@ringcentral.com
 * @Date: 2019-01-04 11:05:25
 * Copyright © RingCentral. All rights reserved.
 */

import { ISubscribeController } from '../interface/ISubscribeController';
import dataDispatcher from '../../../component/DataDispatcher';
import { SOCKET, notificationCenter } from '../../../service';

class SubscribeController implements ISubscribeController {
  constructor(private _subscriptions: Object = {}) {}

  subscribe() {
    Object.entries(this._subscriptions).forEach(([eventName, fn]) => {
      if (eventName.startsWith('SOCKET')) {
        return dataDispatcher.register(eventName as SOCKET, fn);
      }
      notificationCenter.on(eventName, fn);
    });
  }

  unsubscribe() {
    Object.entries(this._subscriptions).forEach(([eventName, fn]) => {
      if (eventName.startsWith('SOCKET')) {
        return dataDispatcher.unregister(eventName as SOCKET, fn);
      }
      notificationCenter.off(eventName, fn);
    });
  }
}

export { SubscribeController };
