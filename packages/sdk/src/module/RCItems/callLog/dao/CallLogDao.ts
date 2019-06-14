/*
 * @Author: Rito.Xiao (rito.xiao@ringcentral.com)
 * @Date: 2019-05-20 11:25:42
 * Copyright © RingCentral. All rights reserved.
 */

import { BaseDao, daoManager, QUERY_DIRECTION } from 'sdk/dao';
import { CallLog } from '../entity';
import { IDatabase } from 'foundation';
import { CallLogViewDao } from './CallLogViewDao';
import { CALL_LOG_SOURCE } from '../constants';
import { Nullable } from 'sdk/types';
import _ from 'lodash';

class CallLogDao extends BaseDao<CallLog, string> {
  static COLLECTION_NAME = 'callLog';
  private _viewDao: CallLogViewDao;

  constructor(db: IDatabase) {
    super(CallLogDao.COLLECTION_NAME, db);
    this._viewDao = daoManager.getDao(CallLogViewDao);
  }

  async put(item: CallLog | CallLog[]): Promise<void> {
    await this.doInTransaction(async () => {
      await Promise.all([
        super.put(item),
        Array.isArray(item)
          ? this._bulkPutCallLogView(item)
          : this._putCallLogView(item),
      ]);
    });
  }

  async bulkPut(array: CallLog[]): Promise<void> {
    await this.doInTransaction(async () => {
      await Promise.all([
        super.bulkPut(array),
        this._bulkPutCallLogView(array),
      ]);
    });
  }

  async clear(): Promise<void> {
    await this.doInTransaction(async () => {
      await Promise.all([super.clear(), this._viewDao.clear()]);
    });
  }

  async delete(key: string): Promise<void> {
    await this.doInTransaction(async () => {
      await Promise.all([super.delete(key), this._viewDao.delete(key)]);
    });
  }

  async bulkDelete(keys: string[]): Promise<void> {
    await this.doInTransaction(async () => {
      await Promise.all([
        super.bulkDelete(keys),
        this._viewDao.bulkDelete(keys),
      ]);
    });
  }

  async update(
    item: Partial<CallLog> | Partial<CallLog>[],
    shouldDoPut: boolean = true,
  ): Promise<void> {
    await this.doInTransaction(async () => {
      await Promise.all([
        super.update(item, shouldDoPut),
        Array.isArray(item)
          ? this._bulkUpdateCallLogView(item, shouldDoPut)
          : this._updateCallLogView(item, shouldDoPut),
      ]);
    });
  }

  async bulkUpdate(
    array: Partial<CallLog>[],
    shouldDoPut: boolean = true,
  ): Promise<void> {
    await this.doInTransaction(async () => {
      await Promise.all([
        super.bulkUpdate(array, shouldDoPut),
        this._bulkUpdateCallLogView(array, shouldDoPut),
      ]);
    });
  }

  async queryCallLogs(
    source: CALL_LOG_SOURCE,
    anchorId?: string,
    direction = QUERY_DIRECTION.OLDER,
    limit: number = Infinity,
  ): Promise<CallLog[]> {
    return this._viewDao.queryCallLogs(
      this._fetchCallLogsFunc,
      source,
      anchorId,
      direction,
      limit,
    );
  }

  async doInTransaction(func: () => {}): Promise<void> {
    await this.getDb().ensureDBOpened();
    await this.getDb().getTransaction(
      'rw',
      [
        this.getDb().getCollection<CallLogDao, string>(
          CallLogDao.COLLECTION_NAME,
        ),
        this.getDb().getCollection<CallLogViewDao, string>(
          CallLogViewDao.COLLECTION_NAME,
        ),
      ],
      async () => {
        await func();
      },
    );
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

  private _fetchCallLogsFunc = async (ids: string[]): Promise<CallLog[]> => {
    return await this.batchGet(ids, true);
  }

  private async _putCallLogView(callLog: CallLog) {
    await this._viewDao.put({
      id: callLog.id,
      result: callLog.result,
      __source: callLog.__source,
      __timestamp: callLog.__timestamp,
    });
  }

  private async _bulkPutCallLogView(array: CallLog[]) {
    await this._viewDao.bulkPut(
      array.map((callLog: CallLog) => {
        return {
          id: callLog.id,
          result: callLog.result,
          __source: callLog.__source,
          __timestamp: callLog.__timestamp,
        };
      }),
    );
  }

  private async _updateCallLogView(
    callLog: Partial<CallLog>,
    shouldDoPut: boolean,
  ) {
    await this._viewDao.update(
      _.pickBy(
        {
          id: callLog.id,
          result: callLog.result,
          __source: callLog.__source,
          __timestamp: callLog.__timestamp,
        },
        _.identity,
      ),
      shouldDoPut,
    );
  }

  private async _bulkUpdateCallLogView(
    array: Partial<CallLog>[],
    shouldDoPut: boolean,
  ) {
    await this._viewDao.bulkUpdate(
      array.map((callLog: CallLog) => {
        return _.pickBy(
          {
            id: callLog.id,
            result: callLog.result,
            __source: callLog.__source,
            __timestamp: callLog.__timestamp,
          },
          _.identity,
        );
      },        shouldDoPut),
    );
  }
}

export { CallLogDao };
