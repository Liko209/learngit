/*
 * @Author: Andy Hu (Andy.hu@ringcentral.com)
 * @Date: 2019-04-01 15:16:45
 * Copyright Ã‚Â© RingCentral. All rights reserved.
 */
import { mainLogger } from 'sdk';
import { AbstractNotification } from './AbstractNotification';
import { NotificationOpts } from '../interface';
import { isSafari } from '@/common/isUserAgent';
import _ from 'lodash';
const logger = mainLogger.tags('DesktopNotification');
export class DeskTopNotification extends AbstractNotification<Notification> {
  isSupported() {
    return !!Notification;
  }

  create(title: string, opts: NotificationOpts) {
    logger.log(`creating notification for ${opts.tag}`);
    const { scope, id } = opts.data;
    const onClick = opts.onClick;

    delete opts.actions;
    delete opts.onClick;

    this.handlePriority(opts);
    const notification = new Notification(title, opts);
    notification.onclick = event => {
      window.focus();
      (event.target as Notification).close();
      this._store.remove(scope, id);
      onClick && onClick(event);
    };

    notification.onclose = event => {
      this._store.remove(scope, id);
    };

    if (isSafari) {
      Object.defineProperty(notification, 'data', {
        writable: true,
        value: opts.data,
      });
    }
    this._store.add(scope, id, [notification]);
  }

  close(scope: string, id: number) {
    const notification = this._store.get(scope, id);
    if (notification && notification[0]) {
      notification[0].close();
    }
  }

  clear(scope: string) {
    // to-do
    Object.values(this._store.items).forEach((i: Notification[]) =>
      i[0].close(),
    );
  }
}
