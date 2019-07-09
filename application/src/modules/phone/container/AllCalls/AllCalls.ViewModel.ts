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
import {
  AllCallsProps,
  FetchAllCallsData,
  CallLogType,
  CallLogFilterFunc,
  CallLogFilterOptions,
} from './types';
import { AllCallsListHandler } from './AllCallsListHandler';
import { HoverControllerViewModel } from '../HoverController';

class AllCallsViewModel extends HoverControllerViewModel<AllCallsProps> {
  @observable
  isError = false;

  @observable
  _filterFunc: CallLogFilterFunc = null;

  private _service = ServiceLoader.getInstance<CallLogService>(
    ServiceConfig.CALL_LOG_SERVICE,
  );

  constructor(props: AllCallsProps) {
    super(props);

    this.reaction(
      () => this.props.filterValue,
      async (filterKey: string) => {
        this._filterFunc = await this._service.buildFilterFunc({
          filterKey,
          callLogSource: this._source,
        });
      },
      { fireImmediately: !this._isAllType },
    );
  }

  @computed
  private get _isAllType() {
    return this.props.type === CallLogType.All;
  }

  @computed
  private get _source() {
    return this._isAllType ? CALL_LOG_SOURCE.ALL : CALL_LOG_SOURCE.MISSED;
  }

  @computed
  private get _handler() {
    return new AllCallsListHandler(
      this.props.type,
      this._fetchData,
      this._filterFunc,
    );
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

    const options: CallLogFilterOptions = {
      callLogSource: this._source,
      anchorId: anchor && anchor.id,
      limit: pageSize,
      direction: realDirection,
    };

    if (this.props.filterValue && this._filterFunc) {
      options.filterFunc = this._filterFunc;
    }

    try {
      return await this._service.fetchCallLogs(options);
    } catch (error) {
      this.isError = true;

      return { data: [], hasMore: true };
    }
  };

  @action
  onErrorReload = () => {
    this.isError = false;
  };
}

export { AllCallsViewModel };
