/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-05-30 16:04:11
 * Copyright © RingCentral. All rights reserved.
 */

import { IFetchSortableDataProvider, ISortableModel } from '@/store/base/fetch';
import { QUERY_DIRECTION } from 'sdk/dao';
import { CallLogService } from 'sdk/module/RCItems/callLog';
import { CallLog } from 'sdk/module/RCItems/callLog/entity/CallLog';
import { ServiceConfig, ServiceLoader } from 'sdk/module/serviceLoader';
import { catchError } from '@/common/catchError';
import { CALL_LOG_SOURCE } from 'sdk/module/RCItems/callLog/constants';
import { CallLogType } from './types';

class AllCallsDataProvider
  implements IFetchSortableDataProvider<CallLog, string> {
  private _type: CallLogType;

  constructor(type: CallLogType = CallLogType.All) {
    this._type = type;
  }

  @catchError.flash({
    network: 'phone.prompt.notAbleToLoadCallLogsForNetworkIssue',
    server: 'phone.prompt.notAbleToLoadCallLogsForServerIssue',
  })
  async fetchData(
    direction: QUERY_DIRECTION,
    pageSize: number,
    anchor?: ISortableModel<string>,
  ): Promise<{ data: CallLog[]; hasMore: boolean }> {
    const callLogService = ServiceLoader.getInstance<CallLogService>(
      ServiceConfig.CALL_LOG_SERVICE,
    );
    const source =
      this._type === CallLogType.All
        ? CALL_LOG_SOURCE.ALL
        : CALL_LOG_SOURCE.MISSED;
    const realDirection =
      direction === QUERY_DIRECTION.NEWER
        ? QUERY_DIRECTION.OLDER
        : QUERY_DIRECTION.NEWER;
    return await callLogService.fetchCallLogs(
      source,
      anchor && anchor.id,
      pageSize,
      realDirection,
    );
  }
}

export { AllCallsDataProvider };
