/*
 * @Author: dennis.jiang (dennis.jiang@ringcentral.com)
 * @Date: 2018-09-18 15:52:02
 * Copyright © RingCentral. All rights reserved.
 */
import BaseNotificationSubscribe from '@/store/base/BaseNotificationSubscribable';
import { getGlobalValue } from '@/store/utils';
import { service } from 'sdk';
import _ from 'lodash';
import { computed, autorun } from 'mobx';
import storeManager from '@/store';

const MessageTypes = [
  service.GROUP_QUERY_TYPE.FAVORITE,
  service.GROUP_QUERY_TYPE.GROUP,
  service.GROUP_QUERY_TYPE.TEAM,
];

export default class LeftNavViewModel extends BaseNotificationSubscribe {
  private messageUmiChannels: string[];
  constructor() {
    super();
    this.initUmiChannels();
    autorun(() => {
      this.appUmi();
    });
  }

  initUmiChannels() {
    this.messageUmiChannels = MessageTypes.map(
      (channel: service.GROUP_QUERY_TYPE) => {
        return `UMI.${channel}`;
      },
    );
  }

  @computed
  get messageUmi() {
    const totalUmi = _.sumBy(this.messageUmiChannels, (umiChannel: string) => {
      const umi = getGlobalValue(umiChannel);
      return umi;
    });
    return totalUmi;
  }

  appUmi() {
    const appUmi = this.messageUmi;
    storeManager.getGlobalStore().set('UMI.app', appUmi);
    return appUmi;
  }
}
