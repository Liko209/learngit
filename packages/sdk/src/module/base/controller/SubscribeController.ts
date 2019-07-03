/*
 * @Author: Thomas thomas.yang@ringcentral.com
 * @Date: 2019-01-04 11:05:25
 * Copyright © RingCentral. All rights reserved.
 */

import { ISubscribeController } from '../../../framework/controller/interface/ISubscribeController';
import dataDispatcher from '../../../component/DataDispatcher';
import { SOCKET } from '../../../service/eventKey';
import notificationCenter from '../../../service/notificationCenter';

class SubscribeController implements ISubscribeController {
  private _isSubscribed = false;
  constructor(private _subscriptions: Object = {}) {}

  subscribe() {
    if (this._isSubscribed) {
      return;
    }

    Object.entries(this._subscriptions).forEach(([eventName, fn]) => {
      if (eventName.startsWith('SOCKET')) {
        return dataDispatcher.register(eventName as SOCKET, fn);
      }
      notificationCenter.on(eventName, fn);
    });
    this._isSubscribed = true;
  }

  unsubscribe() {
    if (!this._isSubscribed) {
      return;
    }
    Object.entries(this._subscriptions).forEach(([eventName, fn]) => {
      if (eventName.startsWith('SOCKET')) {
        return dataDispatcher.unregister(eventName as SOCKET, fn);
      }
      notificationCenter.off(eventName, fn);
    });
    this._isSubscribed = false;
  }

  static buildSubscriptionController(subscriptions: Object) {
    return new SubscribeController(subscriptions);
  }
}

export { SubscribeController };
