/*
 * @Author: Rito.Xiao (rito.xiao@ringcentral.com)
 * @Date: 2019-05-07 15:27:04
 * Copyright © RingCentral. All rights reserved.
 */

import { AbstractService } from '../../../framework/service/AbstractService';
import { IDBConfigService } from './IDBConfigService';
import { DBKVDao } from '../../../dao';
import notificationCenter from '../../../service/notificationCenter';
import { CONFIG_EVENT_TYPE } from '../constants';
import { Listener } from 'eventemitter2';

class DBConfigService extends AbstractService implements IDBConfigService {
  protected configDao: DBKVDao;

  protected onStarted() {}
  protected onStopped() {}

  setConfigDao(dao: DBKVDao) {
    this.configDao = dao;
  }

  async get(module: string, key: string): Promise<any> {
    return await this.configDao.get(`${module}.${key}`);
  }

  async put(module: string, key: string, value: any) {
    await this.configDao.put(`${module}.${key}`, value);
    notificationCenter.emit(
      `${module}.${key}`,
      CONFIG_EVENT_TYPE.UPDATE,
      key,
      value,
    );
  }

  async remove(module: string, key: string) {
    await this.configDao.remove(`${module}.${key}`);
    notificationCenter.emit(`${module}.${key}`, CONFIG_EVENT_TYPE.REMOVE, key);
  }

  async clear() {
    await this.configDao.clear();
  }

  on(module: string, key: string, listener: Listener) {
    notificationCenter.on(`${module}.${key}`, listener);
  }

  off(module: string, key: string, listener: Listener) {
    notificationCenter.off(`${module}.${key}`, listener);
  }
}

export { DBConfigService };
