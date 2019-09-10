/*
 * @Author: isaac.liu
 * @Date: 2019-06-27 08:24:45
 * Copyright © RingCentral. All rights reserved.
 */
import { ModuleConfig } from 'framework/types';
import { createDummyConfig } from '../utils';
import { GlobalSearchStore } from './store';
import { GlobalSearchService } from './service';

const config: ModuleConfig = createDummyConfig([
  GlobalSearchService,
  GlobalSearchStore,
]);

export { config };
