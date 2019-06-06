/*
 * @Author: Thomas thomas.yang@ringcentral.com
 * @Date: 2019-03-01 01:35:02
 * Copyright © RingCentral. All rights reserved.
 */

import { DBConfig } from 'sdk/module/config';
import { daoManager } from 'sdk/dao';
import { RecentSearchModel } from '../entity';
import { SEARCH_CONFIG_KEYS, SEARCH_MODULE_NAME } from './constants';
import { UndefinedAble } from 'sdk/types';
class SearchUserConfig extends DBConfig {
  static moduleName = 'search';

  constructor() {
    super(SEARCH_MODULE_NAME, daoManager.getDBKVDao());
  }

  async setRecentSearchRecords(records: RecentSearchModel[]) {
    await this.put(SEARCH_CONFIG_KEYS.RECENT_SEARCH_RECORDS, records);
  }

  async getRecentSearchRecords(): Promise<UndefinedAble<RecentSearchModel[]>> {
    return await this.get(SEARCH_CONFIG_KEYS.RECENT_SEARCH_RECORDS);
  }
}

export { SearchUserConfig };
