/*
 * @Author: Thomas thomas.yang@ringcentral.com
 * @Date: 2019-02-22 09:08:57
 * Copyright © RingCentral. All rights reserved.
 */

import { RecentSearchTypes, RecentSearchModel } from '../entity';
import { SearchUserConfig } from '../config/SearchUserConfig';

interface ISearchService {
  addRecentSearchRecord(
    type: RecentSearchTypes,
    value: string | number,
    params: {},
  ): Promise<void>;
  clearRecentSearchRecords(): Promise<void>;
  getRecentSearchRecords(): Promise<RecentSearchModel[]>;
  removeRecentSearchRecords(ids: Set<number>): Promise<void>;
  getRecentSearchRecordsByType(
    type: RecentSearchTypes,
  ): Promise<Map<number | string, RecentSearchModel>>;
  userConfig: SearchUserConfig;
}

export { ISearchService };
