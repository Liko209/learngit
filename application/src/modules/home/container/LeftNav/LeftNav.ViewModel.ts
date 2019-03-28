/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-09-29 15:10:30
 * Copyright © RingCentral. All rights reserved.
 */
import { computed } from 'mobx';
import _ from 'lodash';
import { container } from 'framework';
import { promisedComputed } from 'computed-async-mobx';
import { getGlobalValue } from '@/store/utils';
import { GLOBAL_KEYS } from '@/store/constants';
import StoreViewModel from '@/store/ViewModel';
import storeManager from '@/store';
import SectionGroupHandler from '@/store/handler/SectionGroupHandler';
import { HomeStore } from '../../store';
import { NavConfig } from '../../types';
import { LeftNavProps } from './types';

const getItem = (item: string) => {
  return localStorage.getItem(item);
};

const removePlacement = ({ placement, ...navItem }: NavConfig) => navItem;

class LeftNavViewModel extends StoreViewModel {
  // TODO use @lazyInject(HomeStore)
  private _homeStore: HomeStore = container.get(HomeStore);

  constructor(props: LeftNavProps) {
    super(props);
    const key = this._expandKey();
    const isLocalExpand =
      getItem(key) === null ? false : JSON.parse(String(getItem(key)));
    const globalStore = storeManager.getGlobalStore();
    globalStore.set(GLOBAL_KEYS.IS_LEFT_NAV_OPEN, isLocalExpand);
  }

  private _expandKey = () => {
    const userId = getGlobalValue(GLOBAL_KEYS.CURRENT_USER_ID);
    return `${userId}-expanded`;
  }

  icons = promisedComputed([[], []], async () => {
    const navConfigs = await Promise.all(this._homeStore.navConfigs);

    const topIcons = navConfigs
      .filter((navItem: NavConfig) => navItem.placement === 'top')
      .map(removePlacement);

    const bottomIcons = navConfigs
      .filter((navItem: NavConfig) => navItem.placement === 'bottom')
      .map(removePlacement);

    return [topIcons, bottomIcons];
  });

  @computed
  get groupIds() {
    return SectionGroupHandler.getInstance().groupIds;
  }

  @computed
  get isLeftNavOpen() {
    const isExpand = getGlobalValue(GLOBAL_KEYS.IS_LEFT_NAV_OPEN);
    const key = this._expandKey();
    localStorage.setItem(key, JSON.stringify(isExpand));
    return JSON.parse(getItem(key) || 'true');
  }
}

export { LeftNavViewModel };
