/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-08-06 10:32:00
 * Copyright © RingCentral. All rights reserved.
 */
import { UserConfig } from 'sdk/module/config/UserConfig';
import { TELEPHONY_KEYS } from './configKeys';
import { AccountGlobalConfig } from 'sdk/module/account/config';

class DialerUIConfig extends UserConfig {
  constructor() {
    super(AccountGlobalConfig.getUserDictionary(), 'dialer');
  }

  setDialerMarked(marked: boolean) {
    this.put(TELEPHONY_KEYS.DIALER_MARKED, marked);
  }

  getDialerMarked() {
    return this.get(TELEPHONY_KEYS.DIALER_MARKED);
  }
}

export { DialerUIConfig };
