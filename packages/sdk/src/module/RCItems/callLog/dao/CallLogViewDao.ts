/*
 * @Author: Rito.Xiao (rito.xiao@ringcentral.com)
 * @Date: 2019-05-28 10:28:31
 * Copyright © RingCentral. All rights reserved.
 */

import { BaseDao, QUERY_DIRECTION } from 'sdk/dao';
import { CallLogView, CallLog } from '../entity';
import { IDatabase, mainLogger, PerformanceTracer } from 'foundation';
import { CALL_LOG_SOURCE, LOCAL_INFO_TYPE, CALL_RESULT } from '../constants';
import _ from 'lodash';
import { ArrayUtils } from 'sdk/utils/ArrayUtils';
import { DEFAULT_FETCH_SIZE, CALL_DIRECTION } from '../../constants';
import { Nullable } from 'sdk/types';
import { SortUtils } from 'sdk/framework/utils';
import { FetchDataOptions } from '../../types';
import { CALL_LOG_POST_PERFORMANCE_KEYS } from '../config/performanceKeys';

const LOG_TAG = 'CallLogViewDao';

class CallLogViewDao extends BaseDao<CallLogView, string> {
  static COLLECTION_NAME = 'callLogView';
  constructor(db: IDatabase) {
    super(CallLogViewDao.COLLECTION_NAME, db);
  }

  async queryCallLogs(
    fetchCallLogsFunc: (ids: string[]) => Promise<CallLog[]>,
    options: FetchDataOptions<CallLog, string>,
  ): Promise<CallLog[]> {
    const {
      limit = DEFAULT_FETCH_SIZE,
      direction = QUERY_DIRECTION.OLDER,
      anchorId,
      filterFunc,
      callLogSource = CALL_LOG_SOURCE.ALL,
    } = options;

    let anchorCallLog;
    if (anchorId) {
      anchorCallLog = await this.get(anchorId);
      if (!anchorCallLog) {
        mainLogger
          .tags(LOG_TAG)
          .info(
            `queryCallLogs return [], invalid anchorId:${anchorId}, direction:${direction}, limit:${limit}`,
          );
        return [];
      }
    }

    // get all views from callLogView
    const views = await this.getAll();
    if (!views || !views.length) {
      mainLogger.tags(LOG_TAG).info('can not get any callLogView');
      return [];
    }

    // get final fetch ids
    let ids: string[] = [];

    const performanceTracer = PerformanceTracer.start();

    ids = views
      .filter((view: CallLogView) => {
        if (
          (callLogSource === CALL_LOG_SOURCE.ALL &&
            !(view.__localInfo & LOCAL_INFO_TYPE.IS_MISSED_SOURCE)) ||
          (callLogSource === CALL_LOG_SOURCE.MISSED &&
            view.__localInfo & LOCAL_INFO_TYPE.IS_MISSED)
        ) {
          return (
            !filterFunc || filterFunc(this._translate2CallLogForFilter(view))
          );
        }
        return false;
      })
      .sort((viewA: CallLogView, viewB: CallLogView) => {
        return SortUtils.sortModelByKey<CallLogView, string>(
          viewA,
          viewB,
          ['__timestamp'],
          false,
        );
      })
      .map((view: CallLogView) => {
        return view.id;
      });

    ids = ArrayUtils.sliceIdArray(
      ids,
      limit === Infinity ? DEFAULT_FETCH_SIZE : limit,
      anchorId,
      direction,
    );

    performanceTracer.end({
      key: CALL_LOG_POST_PERFORMANCE_KEYS.FILTER_AND_SORT_CALL_LOG,
    });

    // get data by ids
    const data = await fetchCallLogsFunc(ids);
    mainLogger
      .tags(LOG_TAG)
      .info(`queryCallLogs success, resultSize:${data.length}`);

    return data;
  }

  async queryOldestTimestamp(): Promise<Nullable<number>> {
    const view = await this.createQuery()
      .orderBy('__timestamp')
      .first();
    mainLogger.tags(LOG_TAG).info('queryOldestTimestamp, ', view);
    return view ? view.__timestamp : null;
  }

  async queryNewestTimestamp(): Promise<Nullable<number>> {
    const view = await this.createQuery()
      .orderBy('__timestamp', true)
      .first();
    mainLogger.tags(LOG_TAG).info('queryOldestTimestamp, ', view);
    return view ? view.__timestamp : null;
  }

  private _translate2CallLogForFilter(view: CallLogView): CallLog {
    return {
      direction: CALL_DIRECTION.INBOUND,
      from: view.caller,
      result:
        view.__localInfo & LOCAL_INFO_TYPE.IS_MISSED
          ? CALL_RESULT.MISSED
          : CALL_RESULT.UNKNOWN,
      __deactivated: false,
    } as CallLog;
  }
}

export { CallLogViewDao };
