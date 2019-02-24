import { BaseUserConfig, UserConfigService } from '../../module/config';
import { CONFIG_KEYS } from './configKeys';
import { AccountGlobalConfig } from '../account/config';

class NewUserConfig extends BaseUserConfig {
  constructor() {
    super(
      UserConfigService.getInstance() as UserConfigService,
      AccountGlobalConfig.getInstance().getCurrentUserId(),
      'config',
    );
  }

  setMyStateId(id: number) {
    this.put(CONFIG_KEYS.MY_STATE_ID, id);
  }

  getMyStateId() {
    return this.get(CONFIG_KEYS.MY_STATE_ID);
  }
}

export { NewUserConfig };
