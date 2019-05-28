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
import { isFirefox } from '@/common/isUserAgent';
import { mainLogger } from 'sdk';
const logger = mainLogger.tags('AbstractNotificationManager');
class NotificationService implements INotificationService {
  private _permission = new Permission();
  private _notificationDistributors: Map<string, AbstractNotification<any>>;
  private _notificationDistributor: AbstractNotification<any>;
  private _maximumFirefoxTxtLength = 40;
  private _maximumTxtLength = 700;
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
    const { id, scope } = opts.data;
    const tag = `${scope}.${id}`;
    const customOps = { ...opts, tag, silent: true };
    logger.info(`prepare notification for ${tag}`);
    let titleFormatted = title;

    if (isFirefox) {
      customOps.body = this.addEllipsis(
        customOps.body,
        this._maximumFirefoxTxtLength,
      );
      titleFormatted = this.addEllipsis(title, this._maximumFirefoxTxtLength);
    }
    customOps.body = this.addEllipsis(customOps.body, this._maximumTxtLength);
    titleFormatted = this.addEllipsis(title, this._maximumTxtLength);
    if (!this._permission.isGranted) {
      await this._permission.request();
      if (this._permission.isGranted) {
        this._notificationDistributor.create(titleFormatted, customOps);
      }
    } else {
      this._notificationDistributor.create(titleFormatted, customOps);
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
