/*
 * @Author: Lewi Li (lewi.li@ringcentral.com)
 * @Date: 2019-02-25 22:42:15
 * Copyright © RingCentral. All rights reserved.
 */

import { GlobalConfig } from '../../config';
import { ACCOUNT_KEYS } from '../config/configKeys';

class AccountGlobalConfig extends GlobalConfig {
  static moduleName = 'account';

  static setUserDictionary(ud: string) {
    this.put(ACCOUNT_KEYS.USER_DICTIONARY, ud);
  }

  static getUserDictionary() {
    return this.get(ACCOUNT_KEYS.USER_DICTIONARY);
  }

  static removeUserDictionary() {
    this.remove(ACCOUNT_KEYS.USER_DICTIONARY);
  }
}

export { AccountGlobalConfig };
