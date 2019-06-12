/*
 * @Author: Thomas Yang(thomas.yang@ringcentral.com)
 * @Date: 2019-05-28 13:03:03
 * Copyright © RingCentral. All rights reserved.
 */

interface IRCItemSyncConfig {
  setSyncToken(token: string): Promise<void>;
  getSyncToken(): Promise<string>;
  removeSyncToken(): Promise<void>;
  setHasMore(hasMore: boolean): Promise<void>;
  getHasMore(): Promise<boolean>;
  removeHasMore(): Promise<void>;
}

export { IRCItemSyncConfig };
