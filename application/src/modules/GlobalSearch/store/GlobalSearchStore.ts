/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-03-31 21:35:57
 * Copyright © RingCentral. All rights reserved.
 */

import { observable, action } from 'mobx';
import { TAB_TYPE, SEARCH_VIEW, SEARCH_SCOPE } from '../types';

class GlobalSearchStore {
  @observable open: boolean = false;
  @observable searchKey: string = '';
  @observable currentTab: TAB_TYPE;
  @observable currentView: SEARCH_VIEW = SEARCH_VIEW.RECENT_SEARCH;
  @observable searchScope: SEARCH_SCOPE;

  @action
  setOpen(open: boolean) {
    this.open = open;
  }

  @action
  setSearchKey(key: string) {
    this.searchKey = key;
  }

  @action
  setCurrentTab(tab: TAB_TYPE) {
    this.currentTab = tab;
  }

  @action
  setCurrentView(view: SEARCH_VIEW) {
    this.currentView = view;
  }

  @action
  setSearchScope(scope: SEARCH_SCOPE) {
    this.searchScope = scope;
  }

  @action
  clearSearchKey() {
    this.searchKey = '';
    this.currentView = SEARCH_VIEW.RECENT_SEARCH;
  }
}

export { GlobalSearchStore };
