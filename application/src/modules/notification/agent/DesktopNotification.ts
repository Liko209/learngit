/*
 * @Author: Andy Hu (Andy.hu@ringcentral.com)
 * @Date: 2019-04-01 15:16:45
 * Copyright Ã‚Â© RingCentral. All rights reserved.
 */
import { container } from 'framework/ioc';
import { isSafari } from '@/common/isUserAgent';
import { CLIENT_SERVICE, IClientService } from '@/modules/common/interface';
import { NotificationOpts } from '../interface';
import { AbstractNotification } from './AbstractNotification';

export class DeskTopNotification extends AbstractNotification<Notification> {
  constructor() {
    super('DesktopNotification');
  }

  isSupported() {
    return !!Notification;
  }

  showNotification(title: string, opts: NotificationOpts) {
    const { scope, id } = opts.data;
    const onClick = opts.onClick;

    delete opts.actions;
    delete opts.onClick;

    const notification = new Notification(title, opts);
    notification.onclick = event => {
      const windowService: IClientService = container.get(CLIENT_SERVICE);
      windowService.focus();
      (event.target as Notification).close();
      this._store.remove(scope, id);
      onClick && onClick(event);
    };

    notification.onclose = () => {
      this._store.remove(scope, id);
    };

    if (isSafari) {
      Object.defineProperty(notification, 'data', {
        writable: true,
        value: opts.data,
      });
    }
    return notification;
  }

  getNotifications() {
    return Object.values(this._store.items);
  }

  checkNotificationValid() {
    return true;
  }

  close(scope: string, id: number) {
    const notification = this._store.get(scope, id);
    notification && notification.close();
  }

  clear() {
    // to-do
    Object.values(this._store.items).forEach((i: Notification) => i.close());
  }
}
