/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-04-16 09:47:13
 * Copyright © RingCentral. All rights reserved.
 */
import Manager from '../Manager';
import BaseService from './BaseService';
import { INewable } from '../types';

class ServiceManager extends Manager<BaseService> {
  getInstance<T extends BaseService>(ServiceClass: INewable<T>): T {
    return this.get(ServiceClass);
  }
}

const serviceManager: ServiceManager = new ServiceManager();

export { ServiceManager };
export default serviceManager;
