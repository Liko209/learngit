/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-05-30 16:35:54
 * Copyright © RingCentral. All rights reserved.
 */
import { SortUtils } from 'sdk/framework/utils';
import { CallLog } from 'sdk/module/RCItems/callLog/entity/CallLog';
import { ENTITY } from 'sdk/service/eventKey';
import { CALL_RESULT } from 'sdk/module/RCItems/callLog/constants';
import {
  FetchSortableDataListHandler,
  ISortableModel,
} from '@/store/base/fetch';
import { ENTITY_NAME } from '@/store/constants';
import { CallLogType, AllCallsFetchData } from './types';

class AllCallsListHandler {
  fetchSortableDataListHandler: FetchSortableDataListHandler<CallLog, string>;
  constructor(type: CallLogType, fetchData: AllCallsFetchData) {
    const isMatchFunc = (model: CallLog) => {
      const isMissedCall =
        model.result === CALL_RESULT.MISSED ||
        model.result === CALL_RESULT.VOICEMAIL;
      return !!(
        model &&
        !model.__deactivated &&
        (type === CallLogType.MissedCall ? isMissedCall : true)
      );
    };

    const transformFunc = (model: CallLog): ISortableModel<string> => {
      return {
        id: model.id as any,
        sortValue: model.__timestamp,
      };
    };

    const sortFunc = (
      lhs: ISortableModel<string>,
      rhs: ISortableModel<string>,
    ): number => {
      return SortUtils.sortModelByKey<ISortableModel<string>, string>(
        lhs,
        rhs,
        ['sortValue'],
        true,
      );
    };

    this.fetchSortableDataListHandler = new FetchSortableDataListHandler(
      { fetchData },
      {
        isMatchFunc,
        transformFunc,
        sortFunc,
        entityName: ENTITY_NAME.CALL_LOG,
        eventName: ENTITY.CALL_LOG,
        hasMoreDown: true,
      },
    );
  }

  dispose() {
    this.fetchSortableDataListHandler.dispose();
  }
}

export { AllCallsListHandler };
