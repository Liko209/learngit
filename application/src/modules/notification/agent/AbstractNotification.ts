/*
 * @Author: Andy Hu (Andy.hu@ringcentral.com)
 * @Date: 2019-04-01 15:16:45
 * Copyright Ã‚Â© RingCentral. All rights reserved.
 */
import { mainLogger, ILogger } from 'foundation/log';
import { isElectron, isWindows, isEdge } from '@/common/isUserAgent';
import { NotificationStore } from '../store/NotificationStore';
import { NotificationOpts } from '../interface';

const delay = (interval: number) =>
  new Promise(resolve => {
    setTimeout(resolve, interval);
  });

export abstract class AbstractNotification<T> {
  protected _store: NotificationStore<T>;
  protected _logger: ILogger;

  constructor(tag: string) {
    this._logger = mainLogger.tags(tag);
    this._store = new NotificationStore();
  }

  protected async handlePriority(opts: NotificationOpts) {
    if (isEdge || (isElectron && isWindows)) {
      const notifications = await this.getNotifications();
      const { priority } = opts.data;
      const lowPriorityNotifications = notifications.filter(notification => {
        if (notification.data) {
          const { priority: notificationPriority } = notification.data;
          return notificationPriority && notificationPriority > priority;
        }
        return false;
      });

      await Promise.all(
        lowPriorityNotifications.map(async notification => {
          if (notification.data) {
            const { scope, id } = notification.data;
            await this.close(scope, id);
          } else {
            notification.close();
          }
        }),
      );
      const waiting =
        lowPriorityNotifications.length > 10
          ? 500
          : lowPriorityNotifications.length * 50;
      await delay(waiting);
    }
  }

  async create(title: string, opts: NotificationOpts) {
    const isValid = await this.checkNotificationValid(opts.data.id);
    this._logger.log(`check notification for ${opts.tag} is valid`, isValid);
    if (isValid) {
      await this.handlePriority(opts);
      this._logger.log(`creating notification for ${opts.tag}`);
      const result = await this.showNotification(title, opts);
      this._store.add(opts.data.scope, opts.data.id, result);
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
