/*
 * @Author: Andy Hu (Andy.hu@ringcentral.com)
 * @Date: 2019-04-01 15:16:45
 * Copyright Ã‚Â© RingCentral. All rights reserved.
 */
import { mainLogger } from 'sdk';
import { NotificationStore } from './../store/NotificationStore';
import { AbstractNotification } from './AbstractNotification';
import { SWNotificationOptions, notificationAction } from '../interface';
import _ from 'lodash';
type SWCallbackArgs = {
  id: number;
  action: string;
  scope: string;
};
export class SWNotification extends AbstractNotification<notificationAction> {
  static CLIENT_ID = Math.random();

  constructor() {
    const store = new NotificationStore();
    super(store);
    this.isSupported() && this._subscribeWorkerMessage();
  }

  isSupported() {
    return (
      !/^((?!chrome|android).)*safari/i.test(navigator.userAgent) &&
      (navigator !== undefined && navigator.serviceWorker !== undefined)
    );
  }

  private _subscribeWorkerMessage() {
    navigator.serviceWorker.addEventListener('message', event => {
      const data = JSON.parse(event.data) as SWCallbackArgs;

      if (!data.id || !data.action) {
        return;
      }
      this._triggerAction(data);
    });
  }

  private _triggerAction({ action, id, scope }: SWCallbackArgs) {
    const actions = this._store.get(scope, id);
    const item = _.findLast(
      actions,
      (i: notificationAction) => i.action === action,
    );
    if (item) {
      item.handler();
      window.focus();
    }

    this._store.remove(scope, id);
  }

  async create(title: string, opts: SWNotificationOptions) {
    const registration = await window.navigator.serviceWorker.ready;
    const { scope, id } = opts.data;
    opts.data.clientId = SWNotification.CLIENT_ID;
    const actions = opts.actions || [];
    const isSuccessful = await this._checkNotificationValid(id);
    if (isSuccessful) {
      await registration.showNotification(title, opts);
      if (registration.active) {
        registration.active.postMessage('');
        this._store.add(scope, id, actions);
      }
    }
    return isSuccessful;
  }

  async close(scope: string, id: number) {
    const handlers = this._store.get(scope, id);
    if (handlers) {
      this._store.remove(scope, id);
      const notifications = await this._getNotifications();
      for (const notification of notifications) {
        if (notification.data.id === id) {
          notification.close();
        }
      }
    }
  }

  async clear(scope: string) {
    // todo
    const registration = await window.navigator.serviceWorker.ready;
    const notifications = await registration.getNotifications();
    for (const notification of notifications) {
      notification.close();
    }
  }

  private async _getNotifications() {
    const registration = await window.navigator.serviceWorker.ready;
    return await registration.getNotifications();
  }

  private async _checkNotificationValid(id?: number) {
    if (!id) {
      mainLogger.warn('An Id is required to show a notification');
      return false;
    }
    const notifications = await this._getNotifications();
    for (const notification of notifications) {
      const { id: notificationId, clientId } = notification.data;
      const isSameNotificationFromDifferentClient =
        notificationId === id && clientId !== SWNotification.CLIENT_ID;
      if (isSameNotificationFromDifferentClient) {
        return false;
      }
    }
    return true;
  }
}
