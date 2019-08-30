/*
 * @Author: Rito.Xiao (rito.xiao@ringcentral.com)
 * @Date: 2019-05-28 10:28:31
 * Copyright © RingCentral. All rights reserved.
 */

import _ from 'lodash';
import { BaseDao, QUERY_DIRECTION } from 'sdk/dao';
import { CallLogView, CallLog } from '../entity';
import { IDatabase } from 'foundation/db';
import { mainLogger } from 'foundation/log';
import { PerformanceTracer } from 'foundation/performance';
import { CALL_LOG_SOURCE, LOCAL_INFO_TYPE, CALL_RESULT } from '../constants';
import { ArrayUtils } from 'sdk/utils/ArrayUtils';
import { DEFAULT_FETCH_SIZE, CALL_DIRECTION } from '../../constants';
import { Nullable } from 'sdk/types';
import { SortUtils } from 'sdk/framework/utils';
import { FetchDataOptions } from '../../types';
import { CALL_LOG_POST_PERFORMANCE_KEYS } from '../config/performanceKeys';
import { IViewDao } from 'sdk/module/base/dao/IViewDao';
import { RCItemUtils } from '../../utils';

const LOG_TAG = 'CallLogViewDao';

class CallLogViewDao extends BaseDao<CallLogView, string>
  implements IViewDao<string, CallLog, CallLogView> {
  static COLLECTION_NAME = 'callLogView';
  constructor(db: IDatabase) {
    super(CallLogViewDao.COLLECTION_NAME, db);
  }

  toViewItem(callLog: CallLog) {
    return this.toPartialViewItem(callLog) as CallLogView;
  }

  toPartialViewItem(partialCallLog: Partial<CallLog>) {
    const caller = partialCallLog.direction
      ? partialCallLog.direction === CALL_DIRECTION.INBOUND
        ? partialCallLog.from
        : partialCallLog.to
      : undefined;
    return _.pickBy(
      {
        id: partialCallLog.id,
        __timestamp: partialCallLog.__timestamp,
        __localInfo: partialCallLog.__localInfo,
        caller: caller && RCItemUtils.toCallerView(caller),
      },
      value => {
        return value !== undefined && value !== null;
      },
    );
  }

  getCollection() {
    return this.getDb().getCollection<CallLogView, string>(
      CallLogViewDao.COLLECTION_NAME,
    );
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

    // get final fetch ids
    const performanceTracer = PerformanceTracer.start();

    // get all views from callLogView
    const views = await this.queryAllViews(callLogSource, false, filterFunc);
    if (!views || !views.length) {
      mainLogger.tags(LOG_TAG).info('can not get any callLogView');
      performanceTracer.end({
        key: CALL_LOG_POST_PERFORMANCE_KEYS.FILTER_AND_SORT_CALL_LOG,
      });
      return [];
    }

    const ids = ArrayUtils.sliceIdArray(
      views.map(value => value.id),
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

  async queryAllViews(
    source: CALL_LOG_SOURCE,
    desc = false,
    filterFunc?: (data: CallLog) => boolean,
  ): Promise<CallLogView[]> {
    const query = this.createQuery();
    const views = (await query.toArray()).filter(view => {
      if (
        (source === CALL_LOG_SOURCE.ALL &&
          !(view.__localInfo & LOCAL_INFO_TYPE.IS_MISSED_SOURCE)) ||
        (source === CALL_LOG_SOURCE.MISSED &&
          view.__localInfo & LOCAL_INFO_TYPE.IS_MISSED)
      ) {
        return (
          !filterFunc || filterFunc(this._translate2CallLogForFilter(view))
        );
      }
      return false;
    });
    return views.sort((lv: CallLogView, rv: CallLogView) =>
      SortUtils.sortModelByKey<CallLogView, string>(
        lv,
        rv,
        ['__timestamp'],
        desc,
      ),
    );
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

  async getAllUniquePhoneNumberCalls(source: CALL_LOG_SOURCE) {
    const allCalls = await this.queryAllViews(source, true);

    // prettier-ignore
    const phoneNumbers = new Map<string, { id: string; creationTime: number }>();
    for (const callView of allCalls) {
      const phoneNumber = callView.caller
        ? callView.caller.extensionNumber || callView.caller.phoneNumber
        : undefined;
      if (phoneNumber) {
        const view = phoneNumbers.get(phoneNumber);
        if (!view) {
          phoneNumbers.set(phoneNumber, {
            id: callView.id,
            creationTime: callView.__timestamp,
          });
        }
      }
    }

    return phoneNumbers;
  }

  private _translate2CallLogForFilter(view: CallLogView): CallLog {
    return {
      direction: CALL_DIRECTION.INBOUND,
      from: view.caller,
      result:
        view.__localInfo & LOCAL_INFO_TYPE.IS_MISSED
          ? CALL_RESULT.MISSED
          : CALL_RESULT.UNKNOWN,
      deleted: false,
    } as CallLog;
  }
}

export { CallLogViewDao };
