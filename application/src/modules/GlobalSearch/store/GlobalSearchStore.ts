/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-03-31 21:35:57
 * Copyright © RingCentral. All rights reserved.
 */

import { ComponentType } from 'react';
import { observable, action } from 'mobx';
import { TAB_TYPE, SEARCH_VIEW, SEARCH_SCOPE } from '../types';

class GlobalSearchStore {
  @observable alive: boolean = false;
  @observable open: boolean = false;
  @observable searchKey: string = '';
  @observable currentTab: TAB_TYPE;
  @observable groupId: number;

  @observable currentView: SEARCH_VIEW = SEARCH_VIEW.FULL_SEARCH;
  @observable searchScope: SEARCH_SCOPE;

  @action
  setOpen(open: boolean) {
    // Fix memory leaks when dialog toggled caused by input element, React <= 16.9.0
    if (open && !this.alive) {
      this.alive = true;
    }

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
  setGroupId(id: number) {
    this.groupId = id;
  }

  @action
  clearSearchKey() {
    this.searchKey = '';
    this.currentView = SEARCH_VIEW.RECENT_SEARCH;
  }

  @observable extensions: { [key: string]: Set<ComponentType> } = {};

  addExtensions(key: string, extension: ComponentType) {
    if (this.extensions[key]) {
      this.extensions[key].add(extension);
      return;
    }
    this.extensions[key] = new Set([extension]);
  }
}

export { GlobalSearchStore };
