/*
 * @Author: Rito.Xiao (rito.xiao@ringcentral.com)
 * @Date: 2019-04-02 00:44:28
 * Copyright © RingCentral. All rights reserved.
 */

import DBKVDao from '../../framework/dao/impl/DBKVDao';

class UserDBConfig {
  constructor(private _moduleName: string, private _dao: DBKVDao) {}

  protected async get(key: string) {
    return await this._dao.get(`${this._moduleName}.${key}`);
  }

  protected async put(key: string, value: any) {
    await this._dao.put(`${this._moduleName}.${key}`, value);
  }

  protected async remove(key: string) {
    await this._dao.remove(`${this._moduleName}.${key}`);
  }
}

export { UserDBConfig };
