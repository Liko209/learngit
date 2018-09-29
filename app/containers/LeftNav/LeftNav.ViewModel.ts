/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-09-29 15:10:30
 * Copyright © RingCentral. All rights reserved.
 */
import { computed, autorun } from 'mobx';
import _ from 'lodash';
import { AbstractViewModel } from '@/base';
import { getGlobalValue } from '@/store/utils';
import { service } from 'sdk';
import storeManager from '@/store';

const MessageTypes = [
  service.GROUP_QUERY_TYPE.FAVORITE,
  service.GROUP_QUERY_TYPE.GROUP,
  service.GROUP_QUERY_TYPE.TEAM,
];

export default class LeftNavViewModel extends AbstractViewModel {
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
    if (window.jupiterElectron && window.jupiterElectron.setBadgeCount) {
      window.jupiterElectron.setBadgeCount(appUmi);
    }
    return appUmi;
  }
}
