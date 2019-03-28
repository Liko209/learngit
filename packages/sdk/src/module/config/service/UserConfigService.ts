/*
 * @Author: Lewi Li (lewi.li@ringcentral.com)
 * @Date: 2019-02-18 14:36:38
 * Copyright © RingCentral. All rights reserved.
 */
import { IUserConfigService } from './IUserConfigService';
import { BaseConfigService } from './BaseConfigService';

class UserConfigService extends BaseConfigService
  implements IUserConfigService {
  setUserId(id: string) {
    this.setNameSpace(id);
  }
}

export { UserConfigService };
