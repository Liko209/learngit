/*
 * @Author: Andy Hu (Andy.hu@ringcentral.com)
 * @Date: 2019-04-01 15:16:45
 * Copyright Ã‚Â© RingCentral. All rights reserved.
 */
import { NotificationStore } from '../store/NotificationStore';
import { NotificationOpts } from '../interface';
import { isElectron, isWindows, isEdge } from '@/common/isUserAgent';
export abstract class AbstractNotification<T> {
  protected _store: NotificationStore<T>;
  constructor() {
    this._store = new NotificationStore();
  }
  protected handlePriority(opts: NotificationOpts) {
    if (isEdge || (isElectron && isWindows)) {
      const { priority } = opts.data;
      const lowPriorityNotifications = Object.values(this._store.items).filter(
        item => {
          if (item[0] && item[0].data) {
            const { priority: itemPriority } = item[0].data;
            return itemPriority ? itemPriority > priority : true;
          }
          return false;
        },
      );

      lowPriorityNotifications.forEach(notification => {
        notification[0] && notification[0].close();
      });
    }
  }
  abstract isSupported(): boolean;
  abstract create(title: string, opts: NotificationOptions): void;
  abstract close(scope: string, id: number): void;
  abstract clear(scope?: string): void;
}
