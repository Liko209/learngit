/*
 * @Author: Steve Chen (steve.chen@ringcentral.com)
 * @Date: 2018-02-27 23:31:46
 * Copyright © RingCentral. All rights reserved.
 */

import { storageFactory, KVStorage } from './adapter/kv';

class KVStorageManager {
  private kvStorage: KVStorage;

  constructor() {
    this.kvStorage = new KVStorage(storageFactory(window.localStorage));
  }

  clear(): void {
    this.kvStorage.clear();
  }

  getStorage(): KVStorage {
    return this.kvStorage;
  }
}

export default KVStorageManager;
