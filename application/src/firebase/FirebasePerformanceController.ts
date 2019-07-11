/*
 * @Author: kasni.huang (kasni.huang@ringcentral.com)
 * @Date: 2019-07-03 16:14:54
 * Copyright © RingCentral. All rights reserved.
 */

import config from '@/config';
import { FirebasePerformance } from '../../../packages/foundation';

class FirebasePerformanceController {
  initialize() {
    if (config.isProductionAccount()) {
      FirebasePerformance.getInstance().initialize();
    }
  }
}

export { FirebasePerformanceController };
