import { CommonGlobalConfig } from '../../module/config';

import { CONFIG_KEYS } from './configKeys';

class NewGlobalConfig extends CommonGlobalConfig {
  static setPhoneData(info: any) {
    this.put(CONFIG_KEYS.PHONE_DATA, info);
  }

  static getPhoneData() {
    return this.get(CONFIG_KEYS.PHONE_DATA);
  }

  static putConfig(key: string, value: any) {
    this.put(key, value);
  }

  static getConfig(key: string) {
    return this.get(key);
  }

  static removeConfig(key: string) {
    this.remove(key);
  }
}

export { NewGlobalConfig };
