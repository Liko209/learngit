/*
 * @Author: Andy Hu (Andy.hu@ringcentral.com)
 * @Date: 2019-04-01 15:16:45
 * Copyright Ã‚Â© RingCentral. All rights reserved.
 */
import { AbstractNotification } from './AbstractNotification';
import { NotificationOpts } from '../interface';
import _ from 'lodash';

export class DeskTopNotification extends AbstractNotification<Notification> {
  isSupported() {
    return !!Notification;
  }

  create(title: string, opts: NotificationOpts) {
    const { scope, id } = opts.data;
    const onClick = opts.onClick;

    delete opts.actions;
    delete opts.onClick;

    const notification = new Notification(title, opts);
    notification.onclick = (event) => {
      window.focus();
      this._store.get(scope, id).close();
      this._store.remove(scope, id);
      onClick && onClick(event);
    };

    notification.onclose = (event) => {
      this._store.remove(scope, id);
    };

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
