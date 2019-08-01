/*
 * @Author: Paynter Chen
 * @Date: 2019-08-01 14:27:41
 * Copyright © RingCentral. All rights reserved.
 */

import { ScenarioFactory } from '../types';

export function createScenarioFactory<T extends ScenarioFactory>(
  factory: T,
): T {
  return factory;
}
