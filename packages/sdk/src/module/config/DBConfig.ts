/*
 * @Author: Rito.Xiao (rito.xiao@ringcentral.com)
 * @Date: 2019-04-02 00:44:28
 * Copyright © RingCentral. All rights reserved.
 */

import DBKVDao from '../../framework/dao/impl/DBKVDao';
import { IDBConfigService } from './service/IDBConfigService';
import { DBConfigService } from './service/DBConfigService';
import { ServiceConfig, ServiceLoader } from '../serviceLoader';
import { Listener } from 'eventemitter2';

class DBConfig {
  private _configService: IDBConfigService;
  constructor(private _moduleName: string, dao: DBKVDao) {
    this._configService = ServiceLoader.getInstance<DBConfigService>(
      ServiceConfig.DB_CONFIG_SERVICE,
    );
    this._configService.setConfigDao(dao);
  }

  protected async get(key: string) {
    return await this._configService.get(this._moduleName, key);
  }

  protected async put(key: string, value: any) {
    await this._configService.put(this._moduleName, key, value);
  }

  protected async remove(key: string) {
    await this._configService.remove(this._moduleName, key);
  }

  on(key: string, listener: Listener) {
    this._configService.on(this._moduleName, key, listener);
  }

  off(key: string, listener: Listener) {
    this._configService.off(this._moduleName, key, listener);
  }
}

export { DBConfig };
