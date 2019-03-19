/*
 * @Author: Lewi Li (lewi.li@ringcentral.com)
 * @Date: 2019-03-12 10:24:11
 * Copyright © RingCentral. All rights reserved.
 */
import { UserConfig } from '../../config';
import { AccountGlobalConfig } from '../../../service/account/config';

class TelephonyUserConfig extends UserConfig {
  constructor() {
    super(AccountGlobalConfig.getCurrentUserId(), 'telephony');
  }

  putConfig(key: string, value: any) {
    this.put(key, value);
  }

  getConfig(key: string): any {
    return this.get(key);
  }

  removeConfig(key: string) {
    this.remove(key);
  }
}

export { TelephonyUserConfig };
