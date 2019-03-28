/*
 * @Author: Lewi Li (lewi.li@ringcentral.com)
 * @Date: 2019-02-19 15:48:11
 * Copyright © RingCentral. All rights reserved.
 */
import { IGlobalConfigService } from './IGlobalConfigService';
import { BaseConfigService } from './BaseConfigService';

const GLOBAL = 'global';

class GlobalConfigService extends BaseConfigService
  implements IGlobalConfigService {
  constructor() {
    super();
    this.setNameSpace(GLOBAL);
  }
}

export { GlobalConfigService };
