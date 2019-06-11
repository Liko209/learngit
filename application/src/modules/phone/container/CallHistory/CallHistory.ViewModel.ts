/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-06-06 13:14:13
 * Copyright © RingCentral. All rights reserved.
 */

import { StoreViewModel } from '@/store/ViewModel';
import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';
import { CallLogService } from 'sdk/module/RCItems/callLog';

import { CallHistoryViewProps } from './types';

class CallHistoryViewModel extends StoreViewModel<CallHistoryViewProps> {
  get callLogService() {
    return ServiceLoader.getInstance<CallLogService>(
      ServiceConfig.CALL_LOG_SERVICE,
    );
  }

  clearUMI = () => {
    this.callLogService.clearUnreadMissedCall();
  }
}

export { CallHistoryViewModel };
