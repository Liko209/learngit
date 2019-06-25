/*
 * @Author: isaac.liu
 * @Date: 2019-06-03 13:42:18
 * Copyright © RingCentral. All rights reserved.
 */

import { computed, observable, action } from 'mobx';
import { QUERY_DIRECTION } from 'sdk/dao';
import { CallLogService } from 'sdk/module/RCItems/callLog';
import { CALL_LOG_SOURCE } from 'sdk/module/RCItems/callLog/constants';
import { ServiceConfig, ServiceLoader } from 'sdk/module/serviceLoader';
import { StoreViewModel } from '@/store/ViewModel';
import { AllCallsProps, FetchAllCallsData, CallLogType } from './types';
import { AllCallsListHandler } from './AllCallsListHandler';

class AllCallsViewModel extends StoreViewModel<AllCallsProps> {
  @observable
  isError = false;

  private _service = ServiceLoader.getInstance<CallLogService>(
    ServiceConfig.CALL_LOG_SERVICE,
  );

  @computed
  private get _source() {
    return this.props.type === CallLogType.All
      ? CALL_LOG_SOURCE.ALL
      : CALL_LOG_SOURCE.MISSED;
  }

  @computed
  private get _handler() {
    return new AllCallsListHandler(this.props.type, this._fetchData);
  }

  @computed
  get listHandler() {
    return this._handler.fetchSortableDataListHandler;
  }

  @action
  private _fetchData: FetchAllCallsData = async (
    direction,
    pageSize,
    anchor,
  ) => {
    const realDirection =
      direction === QUERY_DIRECTION.NEWER
        ? QUERY_DIRECTION.OLDER
        : QUERY_DIRECTION.NEWER;

    try {
      return await this._service.fetchCallLogs(
        this._source,
        anchor && anchor.id,
        pageSize,
        realDirection,
      );
    } catch (error) {
      this.isError = true;

      return { data: [], hasMore: true };
    }
  }

  @action
  onErrorReload = () => {
    this.isError = false;
  }
}

export { AllCallsViewModel };
