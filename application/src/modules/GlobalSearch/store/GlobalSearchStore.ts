/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-03-31 21:35:57
 * Copyright © RingCentral. All rights reserved.
 */

import { observable, action } from 'mobx';
import { TAB_TYPE } from '../types';

class GlobalSearchStore {
  @observable open: boolean = false;
  @observable searchKey: string = '';
  @observable currentTab: TAB_TYPE;

  constructor() {}

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
}

export { GlobalSearchStore };
