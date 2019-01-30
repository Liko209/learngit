/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-05-23 09:41:26
 * Copyright © RingCentral. All rights reserved.
 */
import { KVStorage } from 'foundation';
import { BaseKVDao } from '../../framework/dao';
import { CONFIG_KEYS, ENV } from './constants';

class ConfigDao extends BaseKVDao {
  static COLLECTION_NAME = 'config';

  constructor(kvStorage: KVStorage) {
    super(ConfigDao.COLLECTION_NAME, kvStorage, CONFIG_KEYS);
  }
  getEnv(): string {
    return this.get(ENV) || '';
  }
  putEnv(env: string): void {
    this.put(ENV, env);
  }
}

export default ConfigDao;
