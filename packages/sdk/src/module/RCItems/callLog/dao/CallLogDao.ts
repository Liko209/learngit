/*
 * @Author: Rito.Xiao (rito.xiao@ringcentral.com)
 * @Date: 2019-05-20 11:25:42
 * Copyright © RingCentral. All rights reserved.
 */

import { daoManager } from 'sdk/dao';
import { CallLog } from '../entity';
import { IDatabase } from 'foundation/db';
import { CallLogViewDao } from './CallLogViewDao';
import { Nullable } from 'sdk/types';
import { FetchDataOptions } from '../../types';
import { CALL_LOG_SOURCE } from '../constants';
import { AbstractComposedDao } from 'sdk/module/base/dao/AbstractComposedDao';

class CallLogDao extends AbstractComposedDao<CallLog, string> {
  static COLLECTION_NAME = 'callLog';
  private _viewDao: CallLogViewDao;

  constructor(db: IDatabase) {
    super(CallLogDao.COLLECTION_NAME, db);
    this._viewDao = daoManager.getDao(CallLogViewDao);
    this.addViewDaos([this._viewDao]);
  }

  async queryCallLogs(
    options: FetchDataOptions<CallLog, string>,
  ): Promise<CallLog[]> {
    return this._viewDao.queryCallLogs(this._fetchCallLogsFunc, options);
  }

  async queryAllUniquePhoneNumberCalls(source: CALL_LOG_SOURCE) {
    return this._viewDao.getAllUniquePhoneNumberCalls(source);
  }

  async callLogCount(): Promise<number> {
    const query = this.createQuery();
    return query.count();
  }

  async queryCallLogBySessionId(sessionId: string): Promise<Nullable<CallLog>> {
    const query = this.createQuery();
    return query.equal('sessionId', sessionId).first();
  }

  async queryOldestTimestamp(): Promise<Nullable<number>> {
    return this._viewDao.queryOldestTimestamp();
  }

  async queryNewestTimestamp(): Promise<Nullable<number>> {
    return this._viewDao.queryNewestTimestamp();
  }

  private _fetchCallLogsFunc = async (ids: string[]): Promise<CallLog[]> =>
    await this.batchGet(ids, true);
}

export { CallLogDao };
