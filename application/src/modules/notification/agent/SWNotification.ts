/*
 * @Author: Andy Hu (Andy.hu@ringcentral.com)
 * @Date: 2019-04-01 15:16:45
 * Copyright Ã‚Â© RingCentral. All rights reserved.
 */
import _ from 'lodash';
import { isElectron, isSafari } from '@/common/isUserAgent';
import { NotificationOpts, NotificationAction } from '../interface';
import { buildAction } from './utils';
import { AbstractNotification } from './AbstractNotification';

type SWCallbackArgs = {
  id: number;
  action: string;
  scope: string;
};

export class SWNotification extends AbstractNotification<NotificationAction[]> {
  static CLIENT_ID = Math.random();
  private _reg: ServiceWorkerRegistration;
  constructor() {
    super('SWNotification');
    this.isSupported() && this._subscribeWorkerMessage();
  }

  isSupported() {
    return (
      !isElectron &&
      !isSafari &&
      navigator !== undefined &&
      navigator.serviceWorker !== undefined
    );
  }

  private _subscribeWorkerMessage() {
    navigator.serviceWorker.addEventListener('message', event => {
      const data = JSON.parse(event.data) as SWCallbackArgs;
      if (!data.id) {
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

  async showNotification(title: string, opts: NotificationOpts) {
    let registration;
    if (this._reg) {
      registration = this._reg;
    } else {
      registration = await window.navigator.serviceWorker.ready;
      this._reg = registration;
    }
    opts.data.clientId = SWNotification.CLIENT_ID;

    await this._reg.showNotification(title, opts);
    const actions = [
      ...(opts.actions || []),
      buildAction({
        action: 'click',
        handler: opts.onClick,
      }),
    ];
    return actions;
  }

  async close(scope: string, id: number) {
    this._store.remove(scope, id);
    const notifications = await this.getNotifications();
    await Promise.all(
      notifications.map(
        async (i: Notification) => i.data && i.data.id === id && i.close(),
      ),
    );
  }

  async clear() {
    // todo
    const notifications = await this.getNotifications();
    for (const notification of notifications) {
      notification.close();
    }
  }

  async getNotifications() {
    const registration = await window.navigator.serviceWorker.ready;
    return registration.getNotifications();
  }

  async checkNotificationValid() {
    // todo multitab problems
    return true;
  }
}
