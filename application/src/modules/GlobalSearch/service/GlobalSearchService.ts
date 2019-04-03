/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-03-31 21:46:14
 * Copyright © RingCentral. All rights reserved.
 */

import { inject } from 'framework';
import { GlobalSearchStore } from '../store';

class GlobalSearchService {
  @inject(GlobalSearchStore) private _globalSearchStore: GlobalSearchStore;

  openGlobalSearch() {
    this._globalSearchStore.setOpen(true);
  }
  closeGlobalSearch() {
    this._globalSearchStore.setOpen(false);
  }
}

export { GlobalSearchService };
