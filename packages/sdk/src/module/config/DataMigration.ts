/*
 * @Author: Lewi Li (lewi.li@ringcentral.com)
 * @Date: 2019-03-05 21:51:56
 * Copyright © RingCentral. All rights reserved.
 */

import store from 'store2';
import { mainLogger } from 'foundation';

// TODO FIJI-4002 should remove this after migration completed

class DataMigration {
  private static _doMigrateKVStorage(
    namespace: string,
    oldKey: string[],
    newKey: string[],
  ) {
    for (const i in oldKey) {
      const value = store.get(oldKey[i]);
      if (value) {
        const key = `${namespace}.${newKey[i]}`;
        store.set(key, value);
        store.remove(oldKey[i]);
      }
    }
  }

  static migrateKVStorage() {
    const userId = store.get('account/user_id');
    if (!userId) {
      mainLogger.info('No need to migrate KV data');
      return;
    }

    // create user dictionary
    store.set('global.account.UD', userId);

    const globalOldKey = [
      'config/DB_SCHEMA_VERSION',
      'config/ENV',
      'config/STATIC_HTTP_SERVER',
    ];
    const globalNewKey = [
      'config.DB_SCHEMA_VERSION',
      'config.ENV',
      'config.STATIC_HTTP_SERVER',
    ];
    this._doMigrateKVStorage('global', globalOldKey, globalNewKey);

    const accountOldKey = [
      'account/client_config',
      'account/company_id',
      'account/profile_id',
      'account/user_id',
    ];
    const accountNewKey = [
      'account.client_config',
      'account.company_id',
      'account.profile_id',
      'account.glip_user_id',
    ];
    this._doMigrateKVStorage(userId, accountOldKey, accountNewKey);

    const authOldKey = ['auth/GLIP_TOKEN', 'auth/RC_TOKEN'];
    const authNewKey = ['auth.GLIP_TOKEN', 'auth.RC_TOKEN'];
    this._doMigrateKVStorage(userId, authOldKey, authNewKey);

    const configOldKey = [
      'config/ACCOUNT_TYPE',
      'config/CLIENT_ID',
      'config/LAST_INDEX_TIMESTAMP',
      'config/post_PREINSERT_KEY_ID',
    ];
    const configNewKey = [
      'account.ACCOUNT_TYPE',
      'account.CLIENT_ID',
      'sync.LAST_INDEX_TIMESTAMP',
      'post.PREINSERT_KEY_ID',
    ];
    this._doMigrateKVStorage(userId, configOldKey, configNewKey);

    const userOldKey = ['config/MY_STATE_ID', 'config/SOCKET_SERVER_HOST'];
    const userNewKey = ['config.MY_STATE_ID', 'sync.socket_server_host'];
    this._doMigrateKVStorage(userId, userOldKey, userNewKey);
  }
}

export { DataMigration };
