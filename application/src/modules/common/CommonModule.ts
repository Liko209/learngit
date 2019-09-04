/*
 * @Author: Andy Hu(andy.hu@ringcentral.com)
 * @Date: 2019-03-04 16:12:23
 * Copyright Ã‚Â© RingCentral. All rights reserved.
 */
import { AbstractModule } from 'framework/AbstractModule';
import { GLOBAL_HOT_KEYS } from '@/modules/app/globalKeys.config';
import { globalKeysManager } from '@/modules/app/globalKeyManager';
import { switchConversationHandler } from '@/modules/common/container/GroupSearch/switchConversationHandler';
import { FeaturesFlagsService } from '@/modules/featuresFlags/service';
import { inject } from 'framework/ioc';
import { Jupiter } from 'framework/Jupiter';

class CommonModule extends AbstractModule {
  @inject(Jupiter) private _jupiter: Jupiter;
  bootstrap() {
    if (this._jupiter.get(FeaturesFlagsService).canUseMessage) {
      globalKeysManager.addGlobalKey(
        GLOBAL_HOT_KEYS.SWITCH_CONVERSATION,
        switchConversationHandler,
      );
    }
  }
}
export { CommonModule };
