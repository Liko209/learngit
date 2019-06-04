/*
 * @Author: isaac.liu
 * @Date: 2019-05-27 10:17:05
 * Copyright © RingCentral. All rights reserved.
 */

import { StoreViewModel } from '@/store/ViewModel';
import { computed, action } from 'mobx';
import { GLOBAL_KEYS } from '@/store/constants';
import storeManager from '@/store';
import { getGlobalValue } from '@/store/utils';
import { LeftRailProps } from './types';
import { getValidPath } from './helper';

class LeftRailViewModel extends StoreViewModel {
  @computed
  get currentTab() {
    return getGlobalValue(GLOBAL_KEYS.CURRENT_TELEPHONY_TAB);
  }

  onReceiveProps(props: LeftRailProps) {
    const { current } = props;
    if (!this.currentTab && this.currentTab !== current) {
      const tab = getValidPath(current);
      this.updateCurrentTab(tab);
    }
  }

  @action
  updateCurrentTab = (path: string) => {
    const globalStore = storeManager.getGlobalStore();
    globalStore.set(GLOBAL_KEYS.CURRENT_TELEPHONY_TAB, path);
  }
}

export { LeftRailViewModel };
