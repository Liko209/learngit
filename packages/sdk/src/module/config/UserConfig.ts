/*
 * @Author: Lewi Li (lewi.li@ringcentral.com)
 * @Date: 2019-02-24 17:29:02
 * Copyright © RingCentral. All rights reserved.
 */

import { IUserConfigService } from './service/IUserConfigService';
import { UserConfigService } from './service/UserConfigService';
import { ServiceConfig, ServiceLoader } from '../serviceLoader';
import { Listener } from 'eventemitter2';

class UserConfig {
  private _configService: IUserConfigService;
  constructor(private _userId: string, private _moduleName: string) {
    this._configService = ServiceLoader.getInstance<UserConfigService>(
      ServiceConfig.USER_CONFIG_SERVICE,
    );
    if (this._userId) {
      this._configService.setUserId(this._userId);
    }
  }

  setUserId(id: number) {
    this._configService.setUserId(id.toString());
  }

  protected get(key: string) {
    return this._configService.get(this._moduleName, key);
  }

  protected put(key: string, value: any) {
    this._configService.put(this._moduleName, key, value);
  }

  protected remove(key: string) {
    this._configService.remove(this._moduleName, key);
  }

  on(key: string, listener: Listener) {
    this._configService.on(this._moduleName, key, listener);
  }

  off(key: string, listener: Listener) {
    this._configService.off(this._moduleName, key, listener);
  }
}

export { UserConfig };
