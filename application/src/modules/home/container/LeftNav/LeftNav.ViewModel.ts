/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-09-29 15:10:30
 * Copyright © RingCentral. All rights reserved.
 */
import { computed } from 'mobx';
import _ from 'lodash';
import { container } from 'framework';
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
    const isLocalExpand =
      getItem('expanded') === null
        ? true
        : JSON.parse(String(getItem('expanded')));
    const globalStore = storeManager.getGlobalStore();
    globalStore.set(GLOBAL_KEYS.IS_LEFT_NAV_OPEN, isLocalExpand);
  }

  @computed
  get icons() {
    const groupIds = this.groupIds;
    const currentConversationId =
      getGlobalValue(GLOBAL_KEYS.CURRENT_CONVERSATION_ID) || '';

    const navConfigs = this._homeStore.getNavConfigs(
      currentConversationId,
      groupIds,
    );

    const topIcons = navConfigs
      .filter(navItem => navItem.placement === 'top')
      .map(removePlacement);

    const bottomIcons = navConfigs
      .filter(navItem => navItem.placement === 'bottom')
      .map(removePlacement);

    return [topIcons, bottomIcons];
  }

  @computed
  get groupIds() {
    return SectionGroupHandler.getInstance().getAllGroupIds();
  }

  @computed
  get isLeftNavOpen() {
    const isExpand = getGlobalValue(GLOBAL_KEYS.IS_LEFT_NAV_OPEN);
    localStorage.setItem('expanded', JSON.stringify(isExpand));
    return JSON.parse(getItem('expanded') || 'true');
  }
}

export { LeftNavViewModel };
