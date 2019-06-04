/*
 * @Author: Rito.Xiao (rito.xiao@ringcentral.com)
 * @Date: 2019-05-28 10:28:31
 * Copyright © RingCentral. All rights reserved.
 */

import { BaseDao, QUERY_DIRECTION } from 'sdk/dao';
import { CallLogView, CallLog } from '../entity';
import { IDatabase, mainLogger } from 'foundation';
import { CALL_LOG_SOURCE, CALL_RESULT } from '../constants';
import _ from 'lodash';
import { ArrayUtils } from 'sdk/utils/ArrayUtils';
import { DEFAULT_FETCH_SIZE } from '../../constants';
import { Nullable } from 'sdk/types';

const LOG_TAG = 'CallLogViewDao';

class CallLogViewDao extends BaseDao<CallLogView, string> {
  static COLLECTION_NAME = 'callLogView';
  constructor(db: IDatabase) {
    super(CallLogViewDao.COLLECTION_NAME, db);
  }

  async queryCallLogs(
    fetchCallLogsFunc: (ids: string[]) => Promise<CallLog[]>,
    source: CALL_LOG_SOURCE,
    anchorId?: string,
    direction = QUERY_DIRECTION.OLDER,
    limit: number = Infinity,
  ): Promise<CallLog[]> {
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
    const views = await this.queryAllViews();
    if (!views || !views.length) {
      mainLogger.tags(LOG_TAG).info('can not get any callLogView');
      return [];
    }

    // get final fetch ids
    let ids: string[] = [];
    views.forEach((view: CallLogView) => {
      if (
        source === view.__source ||
        (source === CALL_LOG_SOURCE.MISSED &&
          view.result === CALL_RESULT.MISSED)
      ) {
        ids.push(view.id);
      }
    });
    ids = ArrayUtils.sliceIdArray(
      ids,
      limit === Infinity ? DEFAULT_FETCH_SIZE : limit,
      anchorId,
      direction,
    );

    // get data by ids
    const data = await fetchCallLogsFunc(ids);
    mainLogger
      .tags(LOG_TAG)
      .info(`queryCallLogs success, resultSize:${data.length}`);

    return data;
  }

  async queryAllViews(): Promise<CallLogView[]> {
    const query = this.createQuery();
    const views = await query.toArray();
    return _.orderBy(views, '__timestamp', 'asc');
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
}

export { CallLogViewDao };
