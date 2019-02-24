import { ACCOUNT_KEYS } from './configKeys';
import { UserConfigService, BaseUserConfig } from '../../../module/config';
import { AccountGlobalConfig } from './accountGlobalConfig';

class AccountUserConfig extends BaseUserConfig {
  constructor() {
    super(
      UserConfigService.getInstance() as UserConfigService,
      AccountGlobalConfig.getInstance().getCurrentUserId(),
      'account',
    );
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
