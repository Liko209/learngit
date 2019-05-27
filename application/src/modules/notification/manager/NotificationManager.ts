/*
 * @Author: Andy Hu (Andy.hu@ringcentral.com)
 * @Date: 2019-04-01 15:16:45
 * Copyright Ã‚Â© RingCentral. All rights reserved.
 */
import { INotificationService, NotificationOpts } from './../interface';
import { mainLogger } from 'sdk';
const logger = mainLogger.tags('AbstractNotificationManager');
type NotificationId = number | string;

export abstract class AbstractNotificationManager {
  @INotificationService
  private _notificationService: INotificationService;

  constructor(protected _scope: string) {}

  show(title: string, opts: NotificationOpts) {
    const { id, scope } = opts.data;
    const tag = `${scope}.${id}`;
    const customOps = { ...opts, tag, silent: true };
    logger.info(`prepare notification for ${tag}`);
    this._notificationService.show(title, customOps);
  }

  close(id: NotificationId) {
    this._notificationService.close(this._scope, id);
  }

  clear() {
    this._notificationService.clear(this._scope);
  }
}
