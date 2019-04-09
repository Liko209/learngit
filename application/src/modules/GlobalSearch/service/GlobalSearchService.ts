/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-03-31 21:46:14
 * Copyright © RingCentral. All rights reserved.
 */

import { inject } from 'framework';
import { GlobalSearchStore } from '../store';
import { SEARCH_VIEW } from '../types';

class GlobalSearchService {
  @inject(GlobalSearchStore) private _globalSearchStore: GlobalSearchStore;

  openGlobalSearch() {
    const store = this._globalSearchStore;
    const currentView =
      store.searchKey === ''
        ? SEARCH_VIEW.RECENT_SEARCH
        : SEARCH_VIEW.INSTANT_SEARCH;
    store.setCurrentView(currentView);
    this._globalSearchStore.setOpen(true);
  }
  closeGlobalSearch() {
    this._globalSearchStore.setOpen(false);
  }
}

export { GlobalSearchService };
