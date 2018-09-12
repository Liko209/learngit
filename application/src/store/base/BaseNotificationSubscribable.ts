/*
 * @Author: Steve Chen (steve.chen@ringcentral.com)
 * @Date: 2018-03-31 23:12:56
 * Copyright © RingCentral. All rights reserved.
 */

import { service } from 'sdk';
import { Listener, EventEmitter2 } from 'eventemitter2';

const { notificationCenter } = service;

export default class BaseNotificationSubscribe extends EventEmitter2 {
  private _notificationObservers: {[eventName: string]: Listener[]} = {};

  private _setNotificationObservers(eventName: string, notificationCallback: Listener) {
    let listeners = this._notificationObservers[eventName];
    if (!listeners) {
      listeners = [];
      this._notificationObservers[eventName] = listeners;
    }
    listeners.push(notificationCallback);
  }

  subscribeNotificationOnce(eventName: string, notificationCallback: Listener) {
    this._setNotificationObservers(eventName, notificationCallback);
    notificationCenter.once(eventName, notificationCallback);
  }

  subscribeNotification(eventName: string, notificationCallback: Listener) {
    this._setNotificationObservers(eventName, notificationCallback);
    notificationCenter.on(eventName, notificationCallback);
  }

  getNotificationObservers() {
    return this._notificationObservers;
  }

  dispose() {
    Object.keys(this._notificationObservers).forEach((eventName) => {
      this._notificationObservers[eventName].forEach((listener) => {
        notificationCenter.removeListener(eventName, listener);
      });
    });

    this._notificationObservers = {};
  }
}
