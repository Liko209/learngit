/*
 * @Author: Paynter Chen
 * @Date: 2019-03-28 15:12:04
 * Copyright © RingCentral. All rights reserved.
 */

import { AbstractModule, container } from 'framework';
import { ContextInfoZipItemProvider } from './ContextInfoZipItemProvider';
import { LogControlManager } from 'sdk';
import { debugLog } from 'sdk/module/debug/log';
import { UploadRecentLogs } from './container/UploadRecentLogs';
import { ZipItemLevel } from 'sdk/service/uploadLogControl/types';
import { FeedbackService } from './service/FeedbackService';

class FeedbackModule extends AbstractModule {
  async bootstrap() {
    LogControlManager.instance().registerZipProvider(
      new ContextInfoZipItemProvider(),
    );
    debugLog.inject('debug', () => UploadRecentLogs.show());
    debugLog.inject('debugAll', () =>
      UploadRecentLogs.show({ level: ZipItemLevel.DEBUG_ALL }),
    );
    debugLog.inject('debugSave', () =>
      container.get(FeedbackService).zipRecentLogs(ZipItemLevel.NORMAL),
    );
    debugLog.inject('debugSaveAll', () =>
      container.get(FeedbackService).zipRecentLogs(ZipItemLevel.DEBUG_ALL),
    );
  }
}

export { FeedbackModule };
