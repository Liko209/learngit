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

class LeftNavViewModel extends AbstractViewModel {
  constructor() {
    super();
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
    return getGlobalValue('isLeftNavOpen');
  }
}

export { LeftNavViewModel };
