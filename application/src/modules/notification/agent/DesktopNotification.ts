/*
 * @Author: Andy Hu (Andy.hu@ringcentral.com)
 * @Date: 2019-04-01 15:16:45
 * Copyright Ã‚Â© RingCentral. All rights reserved.
 */
import { NotificationStore } from '../store/NotificationStore';
import { AbstractNotification } from './AbstractNotification';
import { notificationAction, SWNotificationOptions } from '../interface';
import _ from 'lodash';

export class DeskTopNotification extends AbstractNotification<Notification> {
  constructor() {
    const store = new NotificationStore();
    super(store);
  }

  isSupported() {
    return !!Notification;
  }

  create(title: string, opts: SWNotificationOptions) {
    const actions = opts.actions;
    delete opts.actions;
    const notification = new Notification(title, opts);
    const { scope, id } = opts.data;
    const onClickAction = _.find(
      actions,
      (i: notificationAction) => i.action === 'click',
    );

    const onCloseAction = _.find(
      actions,
      (i: notificationAction) => i.action === 'close',
    );

    notification.onclick = (event) => {
      window.focus();
      onClickAction && onClickAction.handler(event);
    };

    notification.onclose = (event) => {
      this._store.remove(scope, id);
      onCloseAction && onCloseAction.handler(event);
    };

    this._store.remove(scope, id);
    this._store.add(scope, id, [notification]);
  }

  close(scope: string, id: number) {
    return this._store.get(scope, id).close();
  }

  clear(scope: string) {
    // to-do
    Object.values(this._store.items).forEach((i: Notification) => i.close());
  }
}
