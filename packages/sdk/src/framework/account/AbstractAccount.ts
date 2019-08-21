/*
 * @Author: Steve Chen (steve.chen@ringcentral.com)
 * @Date: 2018-06-24 14:16:51
 * Copyright © RingCentral. All rights reserved
 */
import _ from 'lodash';
import { EventEmitter2 } from 'eventemitter2';
import { IAccount } from './IAccount';
import { mainLogger } from 'foundation/log';

const EVENT_SUPPORTED_SERVICE_CHANGE = 'SUPPORTED_SERVICE_CHANGE';
const MODULE_NAME = 'AbstractAccount';
abstract class AbstractAccount extends EventEmitter2 implements IAccount {
  static EVENT_SUPPORTED_SERVICE_CHANGE = EVENT_SUPPORTED_SERVICE_CHANGE;
  private _supportedServices: string[] = [];

  abstract async updateSupportedServices(data: any): Promise<void>;

  getSupportedServices(): string[] {
    return this._supportedServices;
  }

  setSupportedServices(services: string[]): void {
    const newServices = _.difference(services, this._supportedServices);
    const removedServices = _.difference(this._supportedServices, services);
    this._supportedServices = services;
    if (newServices.length > 0) {
      mainLogger
        .tags(MODULE_NAME)
        .log('AbstractAccount -> newServices', newServices);
      this.emit(EVENT_SUPPORTED_SERVICE_CHANGE, newServices, true);
    }

    if (removedServices.length > 0) {
      mainLogger
        .tags(MODULE_NAME)
        .log('AbstractAccount -> removedServices', removedServices);
      this.emit(EVENT_SUPPORTED_SERVICE_CHANGE, removedServices, false);
    }
  }
}

export { AbstractAccount };
