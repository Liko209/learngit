/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2019-03-28 14:09:07
 * Copyright © RingCentral. All rights reserved.
 */

import { CONFIG_KEYS } from './ConfigKeys';
import { CommonGlobalConfig } from '../../module/config';

class DaoGlobalConfig extends CommonGlobalConfig {
  static setDBSchemaVersion(version: number) {
    this.put(CONFIG_KEYS.DB_SCHEMA_VERSION, version);
  }

  static getDBSchemaVersion() {
    return this.get(CONFIG_KEYS.DB_SCHEMA_VERSION);
  }

  static getDBBlockMessageKey() {
    return this.get(CONFIG_KEYS.DB_BLOCK_MESSAGE_KEY);
  }

  static setDBBlockMessageKey(value: number) {
    return this.put(CONFIG_KEYS.DB_BLOCK_MESSAGE_KEY, value);
  }

  static removeDBBlockMessageKey() {
    this.remove(CONFIG_KEYS.DB_BLOCK_MESSAGE_KEY);
  }
}

export { DaoGlobalConfig };
