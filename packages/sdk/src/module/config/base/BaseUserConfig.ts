/*
 * @Author: Lewi Li (lewi.li@ringcentral.com)
 * @Date: 2019-02-24 17:29:02
 * Copyright © RingCentral. All rights reserved.
 */

import { IUserConfigService } from '../service/IUserConfigService';

class BaseUserConfig {
  constructor(
    private _configService: IUserConfigService,
    private _userId: string,
    private _moduleName: string,
  ) {
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

  clear() {
    this._configService.clear();
  }
}

export { BaseUserConfig };
