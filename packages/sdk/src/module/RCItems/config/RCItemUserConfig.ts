/*
 * @Author: Thomas Yang(thomas.yang@ringcentral.com)
 * @Date: 2019-05-28 10:47:46
 * Copyright © RingCentral. All rights reserved.
 */

import { DBConfig } from 'sdk/module/config';
import { daoManager } from 'sdk/dao';
import { RC_ITEM_CONFIG_KEYS } from './constants';
import { IRCItemSyncConfig } from './IRCItemSyncConfig';

class RCItemUserConfig extends DBConfig implements IRCItemSyncConfig {
  constructor(moduleName: string) {
    super(moduleName, daoManager.getDBKVDao());
  }

  async setSyncToken(token: string) {
    await this.put(RC_ITEM_CONFIG_KEYS.SYNC_TOKEN, token);
  }

  async getSyncToken(): Promise<string> {
    return await this.get(RC_ITEM_CONFIG_KEYS.SYNC_TOKEN);
  }

  async removeSyncToken() {
    await this.remove(RC_ITEM_CONFIG_KEYS.SYNC_TOKEN);
  }

  async setHasMore(hasMore: boolean) {
    await this.put(RC_ITEM_CONFIG_KEYS.HAS_MORE_IN_REMOTE, hasMore);
  }

  async getHasMore() {
    const hasMore = await this.get(RC_ITEM_CONFIG_KEYS.HAS_MORE_IN_REMOTE);
    return hasMore === undefined ? true : hasMore;
  }

  async removeHasMore() {
    await this.remove(RC_ITEM_CONFIG_KEYS.HAS_MORE_IN_REMOTE);
  }
}

export { RCItemUserConfig };
