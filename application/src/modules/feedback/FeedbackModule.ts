/*
 * @Author: Paynter Chen
 * @Date: 2019-03-28 15:12:04
 * Copyright © RingCentral. All rights reserved.
 */

import { AbstractModule } from 'framework/AbstractModule';
import { container } from 'framework/ioc';
import { ContextInfoZipItemProvider } from './ContextInfoZipItemProvider';
import { LogControlManager } from 'sdk/module/log';
import { mainLogger } from 'foundation/log';
import { debugLog } from 'sdk/module/debug/log';
import { UploadRecentLogs } from './container/UploadRecentLogs';
import { ZipItemLevel } from 'sdk/module/log/types';
import { FeedbackService } from './service/FeedbackService';
import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';
import { AccountService } from 'sdk/module/account';

const LOG_TAG = '[Feedback]';

class FeedbackModule extends AbstractModule {
  async bootstrap() {
    LogControlManager.instance().registerZipProvider(
      new ContextInfoZipItemProvider(),
    );
    debugLog.inject('debug', () => {
      mainLogger.tags(LOG_TAG).info('execute command: debug');
      if (
        ServiceLoader.getInstance<AccountService>(
          ServiceConfig.ACCOUNT_SERVICE,
        ).isAccountReady()
      ) {
        UploadRecentLogs.show();
      } else {
        mainLogger.tags(LOG_TAG).info('user not login, execute save instead');
        container.get(FeedbackService).saveRecentLogs(ZipItemLevel.NORMAL);
      }
    });
    debugLog.inject('debugAll', () => {
      mainLogger.tags(LOG_TAG).info('execute command: debugAll');
      if (
        ServiceLoader.getInstance<AccountService>(
          ServiceConfig.ACCOUNT_SERVICE,
        ).isAccountReady()
      ) {
        UploadRecentLogs.show({ level: ZipItemLevel.DEBUG_ALL });
      } else {
        mainLogger
          .tags(LOG_TAG)
          .info('user not login, execute saveAll instead');
        container.get(FeedbackService).saveRecentLogs(ZipItemLevel.NORMAL);
      }
    });
    debugLog.inject('save', () => {
      mainLogger.tags(LOG_TAG).info('execute command: save');
      container.get(FeedbackService).saveRecentLogs(ZipItemLevel.NORMAL);
    });
    debugLog.inject('saveAll', () => {
      mainLogger.tags(LOG_TAG).info('execute command: saveAll');
      container.get(FeedbackService).saveRecentLogs(ZipItemLevel.DEBUG_ALL);
    });
  }
}

export { FeedbackModule };
