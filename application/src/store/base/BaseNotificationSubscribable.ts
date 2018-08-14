/*
 * @Author: Steve Chen (steve.chen@ringcentral.com)
 * @Date: 2018-03-31 23:12:56
 * Copyright © RingCentral. All rights reserved.
 */

import { service } from 'sdk';
import { Listener } from 'eventemitter2';

const { notificationCenter } = service;

export default class BaseNotificationSubscribe {
  notificationObservers: Map<string, Listener> = new Map();

  subscribeNotificationOnce(eventName: string, notificationCallback: Listener) {
    this.notificationObservers.set(eventName, notificationCallback);
    notificationCenter.once(eventName, notificationCallback);
  }

  subscribeNotification(eventName: string, notificationCallback: Listener) {
    this.notificationObservers.set(eventName, notificationCallback);
    notificationCenter.on(eventName, notificationCallback);
  }

  dispose() {
    this.notificationObservers.forEach((callback, eventName) => {
      notificationCenter.removeListener(eventName, callback);
    });
    this.notificationObservers.clear();
  }
}
