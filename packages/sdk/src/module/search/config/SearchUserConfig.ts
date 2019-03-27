/*
 * @Author: Thomas thomas.yang@ringcentral.com
 * @Date: 2019-03-01 01:35:02
 * Copyright © RingCentral. All rights reserved.
 */

import { UserConfig } from '../../config';
import { SEARCH_CONFIG_KEYS } from './configKeys';
import { RecentSearchModel } from '../entity';

import { AccountGlobalConfig } from '../../../service/account/config';

class SearchUserConfig extends UserConfig {
  static moduleName = 'search';

  constructor() {
    super(AccountGlobalConfig.getUserDictionary(), SearchUserConfig.moduleName);
  }

  setRecentSearchRecords(records: RecentSearchModel[]) {
    this.put(SEARCH_CONFIG_KEYS.RECENT_SEARCH_RECORDS, records);
  }

  getRecentSearchRecords(): RecentSearchModel[] | undefined {
    return this.get(SEARCH_CONFIG_KEYS.RECENT_SEARCH_RECORDS);
  }
}

export { SearchUserConfig };
