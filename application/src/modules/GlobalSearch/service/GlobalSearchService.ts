/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-03-31 21:46:14
 * Copyright © RingCentral. All rights reserved.
 */

import { ComponentType } from 'react';
import { inject } from 'framework/ioc';
import { GlobalSearchStore } from '../store';
import { SEARCH_VIEW } from '../types';
import { isDialogOpen } from '@/containers/Dialog/utils';

class GlobalSearchService {
  @inject(GlobalSearchStore) private _globalSearchStore: GlobalSearchStore;

  openGlobalSearch() {
    const store = this._globalSearchStore;
    const opened = this._globalSearchStore.open;
    const currentView =
      store.searchKey === ''
        ? SEARCH_VIEW.RECENT_SEARCH
        : SEARCH_VIEW.INSTANT_SEARCH;
    store.setCurrentView(currentView);
    this._globalSearchStore.setFocus(true);
    if (isDialogOpen()) {
      return opened ? false : true;
    }
    this._globalSearchStore.setOpen(true);
    return false;
  }

  closeGlobalSearch() {
    this._globalSearchStore.setOpen(false);
    this._globalSearchStore.setFocus(false);
  }

  registerExtension(key: string, extension: ComponentType) {
    this._globalSearchStore.addExtensions(key, extension);
  }
  unregisterExtension(key: string, extension: ComponentType) {
    this._globalSearchStore.removeExtensions(key, extension);
  }
}

export { GlobalSearchService };
