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
  protected handlePriority(
    notifications: Notification[],
    opts: NotificationOpts,
  ) {
    if (isEdge || (isElectron && isWindows)) {
      const { priority } = opts.data;
      const lowPriorityNotifications = notifications.filter(item => {
        if (item.data) {
          const { priority: itemPriority } = item.data;
          return itemPriority && itemPriority > priority;
        }
        return false;
      });

      lowPriorityNotifications.forEach(notification => {
        if (notification.data) {
          const { scope, id } = notification.data;
          this.close(scope, id);
        } else {
          notification.close();
        }
      });
    }
  }
  abstract isSupported(): boolean;
  abstract create(title: string, opts: NotificationOptions): void;
  abstract close(scope: string, id: number): void;
  abstract clear(scope?: string): void;
}
