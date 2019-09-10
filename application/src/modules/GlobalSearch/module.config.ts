/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-03-31 21:34:18
 * Copyright © RingCentral. All rights reserved.
 */
import { ModuleConfig } from 'framework/types';
import { GlobalSearchModule } from './GlobalSearchModule';
import { GlobalSearchService } from './service';
import { GlobalSearchStore } from './store';

const config: ModuleConfig = {
  entry: GlobalSearchModule,
  provides: [GlobalSearchService, GlobalSearchStore],
};

export { config };
