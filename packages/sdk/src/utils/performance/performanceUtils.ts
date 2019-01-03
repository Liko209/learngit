/*
 * @Author: kasni.huang (kasni.huang@ringcentral.com)
 * @Date: 2019-01-03 20:45:04
 * Copyright © RingCentral. All rights reserved.
 */
import { PERFORMANCE_SCENARIO, PerformanceItem } from './types';

const PERFORMANCE_KEY = 'jupiter';

function trackPerformance(
  scenario: PERFORMANCE_SCENARIO,
  item: PerformanceItem,
) {
  if (!performance[PERFORMANCE_KEY]) {
    performance[PERFORMANCE_KEY] = {};
  }
  if (!performance[PERFORMANCE_KEY][scenario]) {
    performance[PERFORMANCE_KEY][scenario] = [];
  }
  performance[PERFORMANCE_KEY][scenario].push(item);
}

export { trackPerformance };
