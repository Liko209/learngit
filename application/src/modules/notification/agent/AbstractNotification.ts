/*
 * @Author: Andy Hu (Andy.hu@ringcentral.com)
 * @Date: 2019-04-01 15:16:45
 * Copyright Ã‚Â© RingCentral. All rights reserved.
 */
import { mainLogger, ILogger } from 'sdk';
import { isElectron, isWindows, isEdge } from '@/common/isUserAgent';
import { NotificationStore } from '../store/NotificationStore';
import { NotificationOpts } from '../interface';

export abstract class AbstractNotification<T> {
  protected _store: NotificationStore<T>;
  protected _logger: ILogger;

  constructor(tag: string) {
    this._logger = mainLogger.tags(tag);
    this._store = new NotificationStore();
  }

  private _handlePriority(
    notifications: Notification[],
    opts: NotificationOpts,
  ) {
    if (isEdge || (isElectron && isWindows)) {
      const { priority } = opts.data;
      const lowPriorityNotifications = notifications.filter(notification => {
        if (notification.data) {
          const { priority: notificationPriority } = notification.data;
          return notificationPriority && notificationPriority > priority;
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

  async create(title: string, opts: NotificationOpts) {
    const isValid = await this.checkNotificationValid(opts.data.id);
    this._logger.log(`check notification for ${opts.tag} is valid`, isValid);
    if (isValid) {
      this._handlePriority(await this.getNotifications(), opts);
      this._logger.log(`creating notification for ${opts.tag}`);
      const notification = await this.showNotification(title, opts);
      this._store.add(opts.data.scope, opts.data.id, notification);
    }
  }

  protected abstract checkNotificationValid(
    id: number,
  ): Promise<boolean> | boolean;
  protected abstract showNotification(
    title: string,
    opts: NotificationOpts,
  ): Promise<T> | T;
  abstract getNotifications(): Promise<Notification[]> | Notification[];
  abstract isSupported(): boolean;
  abstract close(scope: string, id: number): void;
  abstract clear(scope?: string): void;
}
