/*
 * @Author:Andy Hu (andy.hu@ringcentral.com)
 * @Date: 2019-04-01 14:33:10
 * Copyright Â© RingCentral. All rights reserved.
 */

import { DeskTopNotification } from '../agent/DesktopNotification';
import _ from 'lodash';
import { Permission } from '../Permission';
import { INotificationService, NotificationOpts } from '../interface';
import { AbstractNotification } from '../agent/AbstractNotification';
import { SWNotification } from '../agent/SWNotification';

class NotificationService implements INotificationService {
  private _permission = new Permission();
  private _notificationDistributors: Map<string, AbstractNotification<any>>;
  private _notificationDistributor: AbstractNotification<any>;
  // @ts-ignore
  private _isFirefox = InstallTrigger !== 'undefined';
  private _maximumTitleLength = 40;
  constructor() {
    this._notificationDistributors = new Map();
    this._notificationDistributors.set('sw', new SWNotification());
    this._notificationDistributors.set('desktop', new DeskTopNotification());
  }

  init() {
    for (const _distributor of this._notificationDistributors.values()) {
      const distributor = _distributor as AbstractNotification<any>;
      if (distributor.isSupported()) {
        this._notificationDistributor = distributor;
        break;
      }
    }
  }
  formatterForFirefox(str: string = '') {
    return str && str.length > this._maximumTitleLength
      ? str.substr(0, this._maximumTitleLength) + '...'
      : str;
  }
  async show(title: string, opts: NotificationOpts) {
    if (document.hasFocus()) {
      return;
    }

    if (this._isFirefox) {
      opts.body = this.formatterForFirefox(opts.body);
      title = this.formatterForFirefox(title);
    }
    if (!this._permission.isGranted) {
      const permission = await this._permission.request();
      if (permission) {
        this._notificationDistributor.create(title, opts);
      }
    } else {
      this._notificationDistributor.create(title, opts);
    }
  }

  close(scope: string, id: number) {
    this._notificationDistributor.close(scope, id);
  }

  clear = (scope?: string) => {
    // todo clear scope
    this._notificationDistributor.clear();
  }
}

export { NotificationService };
