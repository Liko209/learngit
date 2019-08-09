/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-08-06 10:32:00
 * Copyright © RingCentral. All rights reserved.
 */
import { UserConfig } from 'sdk/module/config/UserConfig';
import { TELEPHONY_KEYS } from './configKeys';
import { AccountGlobalConfig } from 'sdk/module/account/config';

class E911UIConfig extends UserConfig {
  constructor() {
    super(AccountGlobalConfig.getUserDictionary(), 'E911');
  }

  setE911Marked(marked: boolean) {
    this.put(TELEPHONY_KEYS.E911_MARKED, marked);
  }

  getE911Marked() {
    return this.get(TELEPHONY_KEYS.E911_MARKED);
  }
}

export { E911UIConfig };
