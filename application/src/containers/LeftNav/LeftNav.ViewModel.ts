/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-09-29 15:10:30
 * Copyright © RingCentral. All rights reserved.
 */
import { computed } from 'mobx';
import _ from 'lodash';
import { AbstractViewModel } from '@/base';
import { getGlobalValue } from '@/store/utils';
import { GLOBAL_KEYS } from '@/store/constants';
const MessageTypes = [
  GLOBAL_KEYS.GROUP_QUERY_TYPE_FAVORITE_IDS,
  GLOBAL_KEYS.GROUP_QUERY_TYPE_GROUP_IDS,
  GLOBAL_KEYS.GROUP_QUERY_TYPE_TEAM_IDS,
];
import storeManager from '@/store';
import { LeftNavProps } from './types';

const getItem = (item: string) => {
  return localStorage.getItem(item);
};
class LeftNavViewModel extends AbstractViewModel {
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
  get groupIds() {
    let ids: number[] = [];
    _.forEach(MessageTypes, (messageType: GLOBAL_KEYS) => {
      ids = _.union(getGlobalValue(messageType), ids);
    });
    return ids;
  }

  @computed
  get isLeftNavOpen() {
    const isExpand = getGlobalValue(GLOBAL_KEYS.IS_LEFT_NAV_OPEN);
    localStorage.setItem('expanded', JSON.stringify(isExpand));
    return JSON.parse(getItem('expanded') || 'true');
  }
}

export { LeftNavViewModel };
