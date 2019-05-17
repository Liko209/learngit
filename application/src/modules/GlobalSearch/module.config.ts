/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-03-31 21:34:18
 * Copyright © RingCentral. All rights reserved.
 */
import { ModuleConfig, Jupiter } from 'framework';
import { GlobalSearchModule } from './GlobalSearchModule';
import { GlobalSearchService } from './service';
import { GlobalSearchStore } from './store';

const config: ModuleConfig = {
  entry: GlobalSearchModule,
  binding: (jupiter: Jupiter) => {
    jupiter.registerClass(GlobalSearchService);
    jupiter.registerClass(GlobalSearchStore);
  },
};

export { config };
