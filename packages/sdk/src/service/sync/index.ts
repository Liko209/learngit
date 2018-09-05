/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-07-09 16:18:18
 * Copyright © RingCentral. All rights reserved.
 */
import BaseService from '../BaseService';
import { SOCKET, SERVICE } from '../eventKey';
import { daoManager } from '../../dao';
import ConfigDao from '../../dao/config';
import { LAST_INDEX_TIMESTAMP } from '../../dao/config/constants';
import { fetchIndexData, fetchInitialData, fetchRemainingData } from './fetchIndexData';
import handleData from './handleData';
import { mainLogger } from 'foundation';
import { notificationCenter } from '..';

export default class SyncService extends BaseService {
  private isLoading: boolean;
  constructor() {
    super(null, null, null, []);
    this._subscribeSocketStateChange();
    this.isLoading = false;
  }

  private _subscribeSocketStateChange() {
    notificationCenter.on(SOCKET.STATE_CHANGE, ({ state }: { state: any }) => {
      if (state === 'connected' || state === 'refresh') {
        this.syncData();
      }
    });
  }

  async syncData() {
    if (this.isLoading) {
      return;
    }
    this.isLoading = true;
    const configDao = daoManager.getKVDao(ConfigDao);
    const lastIndexTimestamp = configDao.get(LAST_INDEX_TIMESTAMP);
    if (lastIndexTimestamp) {
      await this._sysnIndexData(lastIndexTimestamp);
    } else {
      await this._firstLogin();
    }
    this.isLoading = false;
  }

  private async _firstLogin() {
    try {
      const currentTime = Date.now();
      let result = await fetchInitialData(currentTime);
      handleData(result);
      result = await fetchRemainingData(currentTime);
      handleData(result);
    } catch (e) {
      mainLogger.error('fetch initial data or remining data error');
      notificationCenter.emitService(SERVICE.DO_SIGN_OUT);
    }
  }
  private async _sysnIndexData(timeStamp: number) {
    // 5 minutes ago to ensure data is correct
    const result = await fetchIndexData(String(timeStamp - 300000));
    handleData(result);
  }
}
