/*
 * @Author: kasni.huang (kasni.huang@ringcentral.com)
 * @Date: 2019-07-03 16:14:54
 * Copyright © RingCentral. All rights reserved.
 */

import config from '@/config';
import {
  FirebasePerformance,
  KVStorageManager
} from '../../../packages/foundation';

class FirebasePerformanceController {
  initialize() {
    const storageManager = new KVStorageManager();
    if (
      window.indexedDB &&
      storageManager.isLocalStorageSupported() &&
      config.isProductionAccount()
    ) {
      FirebasePerformance.getInstance().initialize();
    }
  }
}

export { FirebasePerformanceController };
