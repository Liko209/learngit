/*
 * @Author: Lewi Li (lewi.li@ringcentral.com)
 * @Date: 2019-02-25 22:42:15
 * Copyright © RingCentral. All rights reserved.
 */

import { GlobalConfig } from '../../config';
import { ACCOUNT_KEYS } from '../config/configKeys';
import { Listener } from 'eventemitter2';

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

  static observeUserDictionary(listener: Listener) {
    this.on(ACCOUNT_KEYS.USER_DICTIONARY, listener);
  }

  static unobserveUserDictionary(listener: Listener) {
    this.off(ACCOUNT_KEYS.USER_DICTIONARY, listener);
  }
}

export { AccountGlobalConfig };
