/*
 * @Author: isaac.liu
 * @Date: 2019-06-03 13:42:51
 * Copyright © RingCentral. All rights reserved.
 */
import { FetchSortableDataListHandler } from '@/store/base/fetch';
import { CallLog } from 'sdk/module/RCItems/callLog/entity/CallLog';

// import { AllCallsListHandler } from './AllCallsListHandler';

const CallLogSourceType = {
  All: 'callHistory_allCalls',
  Missed: 'callHistory_missedCalls',
};

enum CallLogType {
  All = 1,
  MissedCall,
}

type AllCallsProps = {
  type: CallLogType;
  height: number;
};

type AllCallsViewProps = {
  listHandler: FetchSortableDataListHandler<CallLog, string>;
} & AllCallsProps;

export { AllCallsProps, AllCallsViewProps, CallLogType, CallLogSourceType };
