/*
 * @Author: isaac.liu
 * @Date: 2019-06-03 13:42:51
 * Copyright © RingCentral. All rights reserved.
 */
import {
  ISortableModel,
  FetchSortableDataListHandler,
} from '@/store/base/fetch';
import { QUERY_DIRECTION } from 'sdk/dao';
import { CallLog } from 'sdk/module/RCItems/callLog/entity/CallLog';

const CallLogSourceType = {
  All: 'callHistory_allCalls',
  Missed: 'callHistory_missedCalls',
};

enum CallLogType {
  All = 1,
  MissedCall,
}

type FetchAllCallsData = (
  direction: QUERY_DIRECTION,
  pageSize: number,
  anchor?: ISortableModel<string>,
) => Promise<{ data: CallLog[]; hasMore: boolean }>;

type AllCallsProps = {
  type: CallLogType;
  height: number;
};

type AllCallsViewProps = {
  isError: boolean;
  onErrorReload: () => void;
  listHandler: FetchSortableDataListHandler<CallLog, string>;
} & AllCallsProps;

export {
  FetchAllCallsData,
  AllCallsProps,
  AllCallsViewProps,
  CallLogType,
  CallLogSourceType,
};
