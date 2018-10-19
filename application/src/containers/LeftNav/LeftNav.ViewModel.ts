/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-09-29 15:10:30
 * Copyright © RingCentral. All rights reserved.
 */
import { computed } from 'mobx';
import _ from 'lodash';
import { service } from 'sdk';
import { AbstractViewModel } from '@/base';
import { getGlobalValue } from '@/store/utils';
const MessageTypes = [
  service.GROUP_QUERY_TYPE.FAVORITE,
  service.GROUP_QUERY_TYPE.GROUP,
  service.GROUP_QUERY_TYPE.TEAM,
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
    globalStore.set('isLeftNavOpen', isLocalExpand);
  }

  @computed
  get groupIds() {
    let ids: number[] = [];
    _.forEach(MessageTypes, (messageType: string) => {
      ids = _.union(getGlobalValue(messageType), ids);
    });
    return ids;
  }

  @computed
  get isLeftNavOpen() {
    const isExpand = getGlobalValue('isLeftNavOpen');
    localStorage.setItem('expanded', JSON.stringify(isExpand));
    return JSON.parse(getItem('expanded') || 'true');
  }
}

export { LeftNavViewModel };
