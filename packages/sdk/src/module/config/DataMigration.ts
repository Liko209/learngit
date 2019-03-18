/*
 * @Author: Lewi Li (lewi.li@ringcentral.com)
 * @Date: 2019-03-05 21:51:56
 * Copyright © RingCentral. All rights reserved.
 */

import store from 'store2';

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
      console.log('No need to migrate KV data');
      return;
    }

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
      'account.user_id',
    ];
    this._doMigrateKVStorage('global', accountOldKey, accountNewKey);

    const authOldKey = ['auth/GLIP_TOKEN', 'auth/RC_TOKEN'];
    const authNewKey = ['auth.GLIP_TOKEN', 'auth.RC_TOKEN'];
    this._doMigrateKVStorage('global', authOldKey, authNewKey);
    const configOldKey = [
      'config/ACCOUNT_TYPE',
      'config/CLIENT_ID',
      'config/DB_SCHEMA_VERSION',
      'config/ENV',
      'config/LAST_INDEX_TIMESTAMP',
      'config/SOCKET_SERVER_HOST',
      'config/STATIC_HTTP_SERVER',
    ];
    const configNewKey = [
      'config.ACCOUNT_TYPE',
      'account.CLIENT_ID',
      'config.DB_SCHEMA_VERSION',
      'config.ENV',
      'config.LAST_INDEX_TIMESTAMP',
      'config.SOCKET_SERVER_HOST',
      'config.STATIC_HTTP_SERVER',
    ];
    this._doMigrateKVStorage('global', configOldKey, configNewKey);

    const userOldKey = ['config/MY_STATE_ID', 'config/SOCKET_SERVER_HOST'];
    const userNewKey = ['config.MY_STATE_ID', 'sync.socket_server_host'];
    this._doMigrateKVStorage(userId, userOldKey, userNewKey);
  }
}

export { DataMigration };
