/*
 * @Author: Thomas thomas.yang@ringcentral.com
 * @Date: 2019-02-22 09:08:57
 * Copyright © RingCentral. All rights reserved.
 */

import { RecentSearchTypes, RecentSearchModel } from '../entity';
interface ISearchService {
  addRecentSearchRecord(
    type: RecentSearchTypes,
    value: string | number,
    params: {},
  ): void;
  clearRecentSearchRecords(): void;
  getRecentSearchRecords(): RecentSearchModel[];
  removeRecentSearchRecords(ids: Set<number>): void;

  getRecentSearchRecordsByType(
    type: RecentSearchTypes,
  ): Map<number | string, RecentSearchModel>;
}

export { ISearchService };
