/*
 * @Author: Thomas thomas.yang@ringcentral.com
 * @Date: 2019-02-22 09:12:22
 * Copyright © RingCentral. All rights reserved.
 */

import _ from 'lodash';
import { AccountDao, daoManager } from '../../../dao';
import { RECENT_SEARCH_RECORDS } from '../../../dao/account/constants';
import { RecentSearchModel, RecentSearchTypes } from '../entity';

const MAX_RECENT_LIMIT = 10;
class RecentSearchRecordController {
  constructor() {}

  addRecentSearchRecord(
    type: RecentSearchTypes,
    value: string | number,
    params: {},
  ) {
    let recentRecords = this.getRecentSearchRecords();
    if (recentRecords.length === MAX_RECENT_LIMIT) {
      recentRecords.pop();
    }

    recentRecords = recentRecords.filter((x: RecentSearchModel) => {
      return x.type !== type || x.value !== value;
    });

    const time = Date.now();
    const model: RecentSearchModel = {
      type,
      value,
      query_params: params,
      id: time,
      time_stamp: time,
    };

    recentRecords = [model].concat(recentRecords);
    this._updateRecentRecords(recentRecords);
  }

  clearRecentSearchRecords() {
    this._updateRecentRecords([]);
  }

  getRecentSearchRecords(): RecentSearchModel[] {
    const accountDao = daoManager.getKVDao(AccountDao);
    const records = accountDao.get(RECENT_SEARCH_RECORDS);
    return records || [];
  }

  removeRecentSearchRecords(toRemoveIds: Set<number>) {
    let records = this.getRecentSearchRecords();
    records = records.filter((record: RecentSearchModel) => {
      return !toRemoveIds.has(record.id);
    });
    this._updateRecentRecords(records);
  }

  private _updateRecentRecords(records: RecentSearchModel[]) {
    const accountDao = daoManager.getKVDao(AccountDao);
    accountDao.put(RECENT_SEARCH_RECORDS, records);
  }
}

export { RecentSearchRecordController };
