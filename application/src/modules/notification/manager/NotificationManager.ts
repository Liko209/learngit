/*
 * @Author: Andy Hu (Andy.hu@ringcentral.com)
 * @Date: 2019-04-01 15:16:45
 * Copyright Ã‚Â© RingCentral. All rights reserved.
 */
import { ServiceLoader } from 'sdk/module/serviceLoader';
import { inject } from 'framework';
import { NOTIFICATION_SERVICE } from '../interface/constant';
import { INotificationService, NotificationOpts } from './../interface/index';
import { EntityBaseService } from 'sdk';
import { IEntityChangeObserver } from 'sdk/framework/controller/types';

export abstract class NotificationManager<T extends EntityBaseService = any> {
  @inject(NOTIFICATION_SERVICE)
  private _notificationService: INotificationService;
  private _service: T;
  protected _observer: IEntityChangeObserver;
  constructor(protected _scope: string, private _serviceName?: string) {}
  init() {
    if (this._serviceName) {
      this._service = ServiceLoader.getInstance<T>(this._serviceName);
      this._service.addEntityNotificationObserver(this._observer);
    }
  }

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

  dispose() {
    if (this._service) {
      this._service.removeEntityNotificationObserver(this._observer);
    }
  }
}
