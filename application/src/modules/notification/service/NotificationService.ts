/*
 * @Author:Andy Hu (andy.hu@ringcentral.com)
 * @Date: 2019-04-01 14:33:10
 * Copyright Â© RingCentral. All rights reserved.
 */

import { DeskTopNotification } from '../agent/DesktopNotification';
import _ from 'lodash';
import { Permission } from '../Permission';
import { INotificationService, Global, NotificationOpts } from '../interface';
import { AbstractNotification } from '../agent/AbstractNotification';
import { SWNotification } from '../agent/SWNotification';

class NotificationService implements INotificationService {
  // @ts-ignore
  private _win: Global = window;
  private _permission = new Permission();
  private _notificationDistributors: Map<string, AbstractNotification<any>>;
  private _notificationDistributor: AbstractNotification<any>;
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

  async show(title: string, opts: NotificationOpts) {
    if (document.hasFocus()) {
      return;
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
