/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-06-24 13:30:37
 * Copyright © RingCentral. All rights reserved.
 */
import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';
import { CallLogService } from 'sdk/module/RCItems/callLog';
import { StoreViewModel } from '@/store/ViewModel';
import { catchError } from '@/common/catchError';
import { analyticsCollector } from '@/AnalyticsCollector';

import { DeleteProps } from './types';

class DeleteAllViewModel extends StoreViewModel<DeleteProps> {
  @catchError.flash({
    network: 'calllog.prompt.notAbleToDeleteAllCallLogForNetworkIssue',
    server: 'calllog.prompt.notAbleToDeleteAllCallLogForServerIssue',
  })
  clearCallLog = async () => {
    const callLogService = ServiceLoader.getInstance<CallLogService>(
      ServiceConfig.CALL_LOG_SERVICE,
    );
    try {
      await callLogService.clearAllCallLogs();
      analyticsCollector.clearAllCallHistory();
      return true;
    } catch (e) {
      throw e;
    }
  }

  totalCount = async () => {
    const callLogService = ServiceLoader.getInstance<CallLogService>(
      ServiceConfig.CALL_LOG_SERVICE,
    );
    return await callLogService.getTotalCount();
  }
}

export { DeleteAllViewModel };
