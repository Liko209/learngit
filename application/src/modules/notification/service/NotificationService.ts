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
import { isFirefox, isEdge } from '@/common/isUserAgent';

class NotificationService implements INotificationService {
  private _permission = new Permission();
  private _notificationDistributors: Map<string, AbstractNotification<any>>;
  private _notificationDistributor: AbstractNotification<any>;
  private _maximumFirefoxTxtLength = 40;
  private _maximumEdgeTxtLength = 700;
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
  addEllipsis(str: string = '', border: number) {
    return str && str.length > border ? `${str.substr(0, border)}...` : str;
  }
  async show(title: string, opts: NotificationOpts) {
    let titleFormatted = title;
    if (document.hasFocus()) {
      return;
    }
    if (isFirefox) {
      opts.body = this.addEllipsis(opts.body, this._maximumFirefoxTxtLength);
      titleFormatted = this.addEllipsis(title, this._maximumFirefoxTxtLength);
    }

    if (isEdge) {
      opts.body = this.addEllipsis(opts.body, this._maximumEdgeTxtLength);
      titleFormatted = this.addEllipsis(title, this._maximumEdgeTxtLength);
    }
    if (!this._permission.isGranted) {
      await this._permission.request();
      if (this._permission.isGranted) {
        this._notificationDistributor.create(titleFormatted, opts);
      }
    } else {
      this._notificationDistributor.create(titleFormatted, opts);
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
