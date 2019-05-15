/*
 * @Author: Lewi Li (lewi.li@ringcentral.com)
 * @Date: 2019-02-19 15:48:11
 * Copyright © RingCentral. All rights reserved.
 */
import { IConfigService } from './IConfigService';
import { BaseConfigService } from './BaseConfigService';
import { GLOBAL_NAME, VERSION_KEY } from '../constants';

class GlobalConfigService extends BaseConfigService implements IConfigService {
  constructor() {
    super();
    this.setNameSpace(GLOBAL_NAME);
  }

  getVersion(moduleName: string): number {
    return this.get(moduleName, VERSION_KEY);
  }

  setVersion(moduleName: string, version: number) {
    this.put(moduleName, VERSION_KEY, version);
  }
}

export { GLOBAL_NAME, GlobalConfigService };
