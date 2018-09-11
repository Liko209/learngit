/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-09-11 14:28:02
 * Copyright © RingCentral. All rights reserved.
 */

import { service } from 'sdk';
import storeManager from '@/store';

const notification = () => {
  const { notificationCenter, SOCKET } = service;
  const globalStore = storeManager.getGlobalStore();

  notificationCenter.on(SOCKET.NETWORK_CHANGE, (data) => {
    globalStore.set('network', data.state);
  });
};

export default notification;
