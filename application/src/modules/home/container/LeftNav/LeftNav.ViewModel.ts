/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-09-29 15:10:30
 * Copyright © RingCentral. All rights reserved.
 */
import { computed } from 'mobx';
import { container } from 'framework';
import { getGlobalValue } from '@/store/utils';
import { GLOBAL_KEYS } from '@/store/constants';
import StoreViewModel from '@/store/ViewModel';
import storeManager from '@/store/base/StoreManager';
import { HomeStore } from '../../store';
import { NavConfig } from '../../types';
import { LeftNavProps } from './types';
import { LeftNavConfig } from './LeftNavConfig';

const removePlacement = ({ placement, ...navItem }: NavConfig) => navItem;

class LeftNavViewModel extends StoreViewModel {
  // TODO use @lazyInject(HomeStore)
  private _homeStore: HomeStore = container.get(HomeStore);

  constructor(props: LeftNavProps) {
    super(props);
    const isLocalExpand = LeftNavConfig.expanded();
    const globalStore = storeManager.getGlobalStore();
    globalStore.set(GLOBAL_KEYS.IS_LEFT_NAV_OPEN, isLocalExpand);
  }

  @computed
  get iconGroups() {
    let navConfigs = this._homeStore.navConfigs;
    navConfigs = navConfigs.filter(({ disable }: NavConfig) => !disable);
    const topIcons = navConfigs
      .filter((navItem: NavConfig) => navItem.placement === 'top')
      .map(removePlacement);

    const bottomIcons = navConfigs
      .filter((navItem: NavConfig) => navItem.placement === 'bottom')
      .map(removePlacement);

    return [topIcons, bottomIcons];
  }

  @computed
  get isLeftNavOpen() {
    const isExpand = getGlobalValue(GLOBAL_KEYS.IS_LEFT_NAV_OPEN);
    LeftNavConfig.setExpanded(isExpand);
    return isExpand;
  }
}

export { LeftNavViewModel };
