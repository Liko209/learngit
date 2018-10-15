/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-07-09 16:18:18
 * Copyright © RingCentral. All rights reserved.
 */
import BaseService from '../BaseService';
import { SERVICE } from '../eventKey';
import { daoManager } from '../../dao';
import ConfigDao from '../../dao/config';
import { LAST_INDEX_TIMESTAMP } from '../../dao/config/constants';
import {
  fetchIndexData,
  fetchInitialData,
  fetchRemainingData,
} from './fetchIndexData';
import handleData from './handleData';
import { mainLogger } from 'foundation';
import { notificationCenter } from '..';
// import PreloadPostsForGroupHandler from './preloadPostsForGroupHandler';

export default class SyncService extends BaseService {
  private isLoading: boolean;
  private onDataLoaded?: () => Promise<void>;
  constructor() {
    const subscriptions = {
      [SERVICE.SOCKET_STATE_CHANGE]: ({ state }: { state: any }) => {
        if (state === 'connected' || state === 'refresh') {
          this.syncData();
        }
      },
    };
    super(null, null, null, subscriptions);
    this.isLoading = false;
  }

  async syncData(onDataLoaded?: () => Promise<void>) {
    this.onDataLoaded = onDataLoaded || this.onDataLoaded;
    if (this.isLoading) {
      return;
    }
    this.isLoading = true;
    const configDao = daoManager.getKVDao(ConfigDao);
    const lastIndexTimestamp = configDao.get(LAST_INDEX_TIMESTAMP);
    if (lastIndexTimestamp) {
      await this._syncIndexData(lastIndexTimestamp);
    } else {
      await this._firstLogin();
    }
    this.isLoading = false;
    // this._preloadPosts();
  }

  // private async _preloadPosts() {
  //   const handler = new PreloadPostsForGroupHandler();
  //   handler.preloadPosts();
  // }

  private async _firstLogin() {
    try {
      const currentTime = Date.now();
      console.time('_firstLogin: fetchInitialData');
      let result = await fetchInitialData(currentTime);
      this.onDataLoaded && (await this.onDataLoaded());
      await handleData(result);
      console.timeEnd('_firstLogin: fetchInitialData');
      console.time('_firstLogin: fetchRemainingData');
      result = await fetchRemainingData(currentTime);
      this.onDataLoaded && (await this.onDataLoaded());
      await handleData(result);
      console.timeEnd('_firstLogin: fetchRemainingData');
    } catch (e) {
      mainLogger.error('fetch initial data or remaining data error');
      notificationCenter.emitService(SERVICE.DO_SIGN_OUT);
    }
  }

  private async _syncIndexData(timeStamp: number) {
    // 5 minutes ago to ensure data is correct
    const result = await fetchIndexData(String(timeStamp - 300000));
    this.onDataLoaded && (await this.onDataLoaded());
    await handleData(result);
  }
}
