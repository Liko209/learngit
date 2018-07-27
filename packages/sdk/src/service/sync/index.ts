/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-07-09 16:18:18
 * Copyright © RingCentral. All rights reserved.
 */
import BaseService from '../BaseService';
import { SOCKET } from '../eventKey';
import fetchIndexData from './fetchIndexData';
import handleData from './handleData';

export default class SyncService extends BaseService {
  constructor() {
    const subscriptions = {
      [SOCKET.STATE_CHANGE]: ({ state }: { state: any }) => {
        if (state === 'connected' || state === 'refresh') {
          this.syncData();
        }
      }
    };
    super(null, null, null, subscriptions);
  }

  async syncData() {
    const result = await fetchIndexData();
    handleData(result);
  }
}
