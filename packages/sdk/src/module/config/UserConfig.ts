/*
 * @Author: Lewi Li (lewi.li@ringcentral.com)
 * @Date: 2019-02-24 17:29:02
 * Copyright © RingCentral. All rights reserved.
 */

import { IUserConfigService } from './service/IUserConfigService';
import { UserConfigService } from './service/UserConfigService';

class UserConfig {
  private _configService: IUserConfigService;
  constructor(private _userId: string, private _moduleName: string) {
    this._configService = UserConfigService.getInstance() as UserConfigService;
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
}

export { UserConfig };
