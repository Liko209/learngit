/*
 * @Author: Andy Hu (Andy.hu@ringcentral.com)
 * @Date: 2019-04-01 15:16:45
 * Copyright Ã‚Â© RingCentral. All rights reserved.
 */
import { inject } from 'framework';
import { NOTIFICATION_SERVICE } from '../interface/constant';
import { INotificationService, NotificationOpts } from './../interface/index';

type NotificationId = number | string;
export abstract class AbstractNotificationManager {
  @inject(NOTIFICATION_SERVICE)
  private _notificationService: INotificationService;

  constructor(protected _scope: string) {}

  show(title: string, opts: NotificationOpts) {
    if (document.hasFocus()) {
      return;
    }
    this._notificationService.show(title, opts);
  }

  close(id: NotificationId) {
    this._notificationService.close(this._scope, id);
  }

  clear() {
    this._notificationService.clear(this._scope);
  }
}
