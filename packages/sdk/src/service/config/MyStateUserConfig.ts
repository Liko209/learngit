import { UserConfig } from '../../module/config';
import { CONFIG_KEYS } from './configKeys';
import { AccountGlobalConfig } from '../account/config';

class MyStateUserConfig extends UserConfig {
  constructor() {
    super(AccountGlobalConfig.getUserDictionary(), 'config');
  }

  setMyStateId(id: number) {
    this.put(CONFIG_KEYS.MY_STATE_ID, id);
  }

  getMyStateId() {
    return this.get(CONFIG_KEYS.MY_STATE_ID);
  }
}

export { MyStateUserConfig };
