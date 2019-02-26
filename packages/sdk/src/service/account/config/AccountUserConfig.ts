import { ACCOUNT_KEYS } from './configKeys';
import { UserConfig } from '../../../module/config';
import { AccountGlobalConfig } from './AccountGlobalConfig';

class AccountUserConfig extends UserConfig {
  constructor() {
    super(AccountGlobalConfig.getCurrentUserId(), 'account');
  }

  setClientConfig(config: any) {
    this.put(ACCOUNT_KEYS.ACCOUNT_CLIENT_CONFIG, config);
  }

  getClientConfig() {
    return this.get(ACCOUNT_KEYS.ACCOUNT_CLIENT_CONFIG);
  }

  getUnreadToggleSetting() {
    return this.get(ACCOUNT_KEYS.UNREAD_TOGGLE_ON);
  }

  setUnreadToggleSetting(value: boolean) {
    this.put(ACCOUNT_KEYS.UNREAD_TOGGLE_ON, value);
  }
}

export { AccountUserConfig };
