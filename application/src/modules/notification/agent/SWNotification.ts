/*
 * @Author: Andy Hu (Andy.hu@ringcentral.com)
 * @Date: 2019-04-01 15:16:45
 * Copyright Ã‚Â© RingCentral. All rights reserved.
 */
import { buildAction } from './utils';
import { AbstractNotification } from './AbstractNotification';
import { NotificationOpts, NotificationAction } from '../interface';
import _ from 'lodash';
type SWCallbackArgs = {
  id: number;
  action: string;
  scope: string;
};
export class SWNotification extends AbstractNotification<NotificationAction> {
  static CLIENT_ID = Math.random();
  private _reg: ServiceWorkerRegistration;
  private _notifications: Notification[] = [];
  constructor() {
    super();
    this.isSupported() && this._subscribeWorkerMessage();
  }

  isSupported() {
    return (
      navigator.userAgent.indexOf('Edge') === -1 &&
      !/^((?!chrome|android).)*safari/i.test(navigator.userAgent) &&
      (navigator !== undefined && navigator.serviceWorker !== undefined)
    );
  }

  private _subscribeWorkerMessage() {
    navigator.serviceWorker.addEventListener('message', (event) => {
      const data = JSON.parse(event.data) as SWCallbackArgs;
      if (!Number.isInteger(data.id)) {
        return;
      }
      /* when user click on the notification, the action is '' on chrome and undefined on firefox */
      if (!data.action) {
        data.action = 'click';
      }
      this._triggerAction(data);
    });
  }

  private _triggerAction({ action, id, scope }: SWCallbackArgs) {
    const actions = this._store.get(scope, id);
    const item = _.findLast(
      actions,
      (i: NotificationAction) => i.action === action,
    );
    if (item) {
      item.handler();
    }
    this._store.remove(scope, id);
  }

  async create(title: string, opts: NotificationOpts) {
    let registration;
    if (this._reg) {
      registration = this._reg;
    } else {
      registration = await window.navigator.serviceWorker.ready;
      this._reg = registration;
    }
    const { scope, id } = opts.data;
    opts.data.clientId = SWNotification.CLIENT_ID;
    const actions = opts.actions || [];
    actions.push(
      buildAction({
        action: 'click',
        handler: opts.onClick,
      }),
    );
    const isSuccessful = await this._checkNotificationValid(id);
    if (isSuccessful) {
      await this._reg.showNotification(title, opts);
      this._store.add(scope, id, actions);
      this._updateNotificationsList();
    }
    return isSuccessful;
  }

  async close(scope: string, id: number) {
    this._store.remove(scope, id);
    const notifications = this._notifications;
    await Promise.all(
      notifications.map(
        async (i: Notification) => i.data.id === id && i.close(),
      ),
    );
    this._updateNotificationsList();
  }

  async clear(scope: string) {
    // todo
    const notifications = this._notifications;
    for (const notification of notifications) {
      notification.close();
    }
    this._notifications = [];
  }
  private async _updateNotificationsList() {
    const notifications = await this._reg.getNotifications();
    this._notifications = _.unionBy(this._notifications, notifications, 'tag');
  }
  private async _getNotifications() {
    const registration = await window.navigator.serviceWorker.ready;
    return await registration.getNotifications();
  }

  private async _checkNotificationValid(id: number) {
    const notifications = await this._getNotifications();
    for (const notification of notifications) {
      const { id: notificationId, clientId } = notification.data;
      const isSameNotificationFromDifferentClient =
        notificationId === id && clientId !== SWNotification.CLIENT_ID;
      if (isSameNotificationFromDifferentClient) {
        console.log('notification failed');
        return false;
      }
    }
    console.log('notification success');
    return true;
  }
}
