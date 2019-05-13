/*
 * @Author: Paynter Chen
 * @Date: 2019-03-28 15:12:04
 * Copyright © RingCentral. All rights reserved.
 */

import { AbstractModule } from 'framework';
import { ContextInfoZipItemProvider } from './ContextInfoZipItemProvider';
import { LogControlManager } from 'sdk';

class FeedbackModule extends AbstractModule {
  async bootstrap() {
    LogControlManager.instance().registerZipProvider(
      new ContextInfoZipItemProvider(),
    );
  }
}

export { FeedbackModule };
