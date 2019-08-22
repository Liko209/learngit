/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-03-31 21:35:13
 * Copyright © RingCentral. All rights reserved.
 */

import { AbstractModule } from 'framework/AbstractModule';
import { GLOBAL_HOT_KEYS } from '@/modules/app/globalKeys.config';
import { globalKeysManager } from '@/modules/app/globalKeyManager';
import { openSearch } from './globalKeyHandlers';

class GlobalSearchModule extends AbstractModule {
  async bootstrap() {
    globalKeysManager.addGlobalKey(GLOBAL_HOT_KEYS.OPEN_SEARCH, openSearch);
  }
}

export { GlobalSearchModule };
