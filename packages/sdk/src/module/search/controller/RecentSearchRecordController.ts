/*
 * @Author: Thomas thomas.yang@ringcentral.com
 * @Date: 2019-02-22 09:12:22
 * Copyright © RingCentral. All rights reserved.
 */

import _ from 'lodash';
import { SearchService } from '../service';
import { RecentSearchModel, RecentSearchTypes } from '../entity';
import { serializeUrlParams } from '../../../utils';
import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';
import { SearchUserConfig } from '../config/SearchUserConfig';

const MAX_RECENT_LIMIT = 10;
class RecentSearchRecordController {
  constructor(private _searchConfig: SearchUserConfig) {}

  async addRecentSearchRecord(
    type: RecentSearchTypes,
    value: string | number,
    params: {},
  ) {
    let recentRecords = await this.getRecentSearchRecords();
    if (recentRecords.length === MAX_RECENT_LIMIT) {
      recentRecords.pop();
    }

    recentRecords = recentRecords.filter((x: RecentSearchModel) => {
      return (
        x.type !== type ||
        x.value !== value ||
        serializeUrlParams(x.query_params) !== serializeUrlParams(params)
      );
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
    await this._updateRecentRecords(recentRecords);
  }

  async clearRecentSearchRecords() {
    await this._updateRecentRecords([]);
  }

  async getRecentSearchRecords(): Promise<RecentSearchModel[]> {
    const searchConfig = ServiceLoader.getInstance<SearchService>(
      ServiceConfig.SEARCH_SERVICE,
    ).userConfig;
    const records = await searchConfig.getRecentSearchRecords();
    return records || [];
  }

  async removeRecentSearchRecords(toRemoveIds: Set<number>) {
    let records = await this.getRecentSearchRecords();
    records = records.filter((record: RecentSearchModel) => {
      return !toRemoveIds.has(record.id);
    });
    this._updateRecentRecords(records);
  }

  async getRecentSearchRecordsByType(
    type: RecentSearchTypes,
  ): Promise<Map<number | string, RecentSearchModel>> {
    const records = await this._searchConfig.getRecentSearchRecords();
    const result = new Map<number | string, RecentSearchModel>();
    records &&
      records.forEach((model: RecentSearchModel) => {
        if (model.type === type) {
          result.set(model.value, model);
        }
      });
    return result;
  }

  private async _updateRecentRecords(records: RecentSearchModel[]) {
    this._searchConfig.setRecentSearchRecords(records);
  }
}

export { RecentSearchRecordController };
