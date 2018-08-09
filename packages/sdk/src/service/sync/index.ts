/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-07-09 16:18:18
 * Copyright © RingCentral. All rights reserved.
 */
import BaseService from '../BaseService';
import { SOCKET } from '../eventKey';
import { daoManager } from '../../dao';
import ConfigDao from '../../dao/config';
import { LAST_INDEX_TIMESTAMP } from '../../dao/config/constants';
import { fetchIndexData, fetchInitialData } from './fetchIndexData';
import handleData from './handleData';

export default class SyncService extends BaseService {
  private isLoading: boolean;
  constructor() {
    const subscriptions = {
      [SOCKET.STATE_CHANGE]: ({ state }: { state: any }) => {
        if (state === 'connected' || state === 'refresh') {
          this.syncData();
        }
      },
    };
    super(null, null, null, subscriptions);
    this.isLoading = false;
  }

  async syncData() {
    if (this.isLoading) {
      return;
    }
    this.isLoading = true;
    const configDao = daoManager.getKVDao(ConfigDao);
    const lastIndexTimestamp = configDao.get(LAST_INDEX_TIMESTAMP);
    if (lastIndexTimestamp) {
      await this.sysnIndexData(lastIndexTimestamp);
    }
    else {
      await this.firstLogin();
    }
    this.isLoading = false;
  }

  private async firstLogin() {
    let result = await fetchInitialData();
    handleData(result);
    // result = await fetchRemainingData();
    // handleData(result, false);
  }
  private async sysnIndexData(timeStamp: number) {
    // 5 minutes ago to ensure data is correct
    const result = await fetchIndexData(String(timeStamp - 300000));
    handleData(result);
  }
}
