/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-06-24 13:30:37
 * Copyright © RingCentral. All rights reserved.
 */
import { action, computed } from 'mobx';
import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';
import { CallLogService } from 'sdk/module/RCItems/callLog';
import { StoreViewModel } from '@/store/ViewModel';
import { catchError } from '@/common/catchError';
import { DeleteProps } from './types';
import { AllCallsListHandler } from '../../AllCalls/AllCallsListHandler';
import { CallLogType } from '../../AllCalls/types';

class DeleteAllViewModel extends StoreViewModel<DeleteProps> {
  @catchError.flash({
    network: 'calllog.prompt.notAbleToDeleteCallLogForNetworkIssue',
    server: 'calllog.prompt.notAbleToDeleteCallLogForServerIssue',
  })
  @action
  clearCallLog = async () => {
    const callLogService = ServiceLoader.getInstance<CallLogService>(
      ServiceConfig.CALL_LOG_SERVICE,
    );
    return callLogService.clearAllCallLogs();
  }

  @computed
  get listHandler() {
    const length = new AllCallsListHandler(CallLogType.All)
      .fetchSortableDataListHandler.sortableListStore.getIds;
    console.log('nello ', length);
    return length;
  }
}

export { DeleteAllViewModel };
