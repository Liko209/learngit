/*
 * @Author: Andy Hu (Andy.hu@ringcentral.com)
 * @Date: 2019-04-01 15:16:45
 * Copyright Ã‚Â© RingCentral. All rights reserved.
 */
import { inject } from 'framework';
import { NOTIFICATION_SERVICE } from '../interface/constant';
import { INotificationService, NotificationOpts } from './../interface/index';

export abstract class NotificationManager {
  @inject(NOTIFICATION_SERVICE)
  private _notificationService: INotificationService;

  constructor(protected _scope: string) {}
  show(title: string, opts: NotificationOpts) {
    const { id, scope } = opts.data;
    const tag = `${scope}.${id}`;
    opts.tag = tag;
    this._notificationService.show(title, opts);
  }

  close(id: number) {
    this._notificationService.close(this._scope, id);
  }

  clear() {
    this._notificationService.clear(this._scope);
  }
}
