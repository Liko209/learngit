/*
 * @Author: Thomas thomas.yang@ringcentral.com
 * @Date: 2019-02-22 09:08:57
 * Copyright © RingCentral. All rights reserved.
 */

import { RecentSearchModel } from '../entity';
interface ISearchService {
  addRecentSearchRecord(model: RecentSearchModel): void;
  clearRecentSearchRecords(): void;
  getRecentSearchRecords(): RecentSearchModel[];
  removeRecentSearchRecords(ids: Set<number>): void;
}

export { ISearchService };
