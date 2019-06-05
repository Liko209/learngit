/*
 * @Author: isaac.liu
 * @Date: 2019-05-27 15:42:30
 * Copyright © RingCentral. All rights reserved.
 */
import { GlobalConfig } from 'sdk/module/config/GlobalConfig';
import { HAS_SAW_DIALPAD, MODULE_NAME } from '../../interface/constant';
import { AccountGlobalConfig } from 'sdk/module/account/config';

class PhoneTabConfig extends GlobalConfig {
  static moduleName = MODULE_NAME;
  static getKey() {
    const userID = AccountGlobalConfig.getUserDictionary();
    return `${userID}.${HAS_SAW_DIALPAD}`;
  }

  static hasShowDialPad() {
    return this.get(this.getKey());
  }

  static setShowDialPad() {
    this.put(this.getKey(), true);
  }
}

export { PhoneTabConfig };
