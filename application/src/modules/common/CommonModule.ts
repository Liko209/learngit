/*
 * @Author: Andy Hu(andy.hu@ringcentral.com)
 * @Date: 2019-03-04 16:12:23
 * Copyright Ã‚Â© RingCentral. All rights reserved.
 */
import { AbstractModule } from 'framework/AbstractModule';
import { GLOBAL_HOT_KEYS } from '@/modules/app/globalKeys.config';
import { globalKeysManager } from '@/modules/app/globalKeyManager';
import { openGroupSearchHandler } from '@/modules/common/container/GroupSearch/openGroupSearchHandler';

class CommonModule extends AbstractModule {
  bootstrap() {
    globalKeysManager.addGlobalKey(
      GLOBAL_HOT_KEYS.OPEN_GROUP_SEARCH,
      openGroupSearchHandler,
    );
  }
}
export { CommonModule };
