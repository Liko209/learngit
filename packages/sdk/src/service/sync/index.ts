/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-07-09 16:18:18
 * Copyright © RingCentral. All rights reserved.
 */
import { mainLogger, ERROR_CODES_NETWORK } from 'foundation';
import BaseService from '../BaseService';
import { SERVICE } from '../eventKey';
import { IndexDataModel } from '../../api/glip/user';
import { daoManager } from '../../dao';
import ConfigDao from '../../dao/config';
import GroupDao from '../../dao/group';
import PersonDao from '../../dao/person';
import PostDao from '../../dao/post';
import ItemDao from '../../dao/item';
import { LAST_INDEX_TIMESTAMP } from '../../dao/config/constants';
import {
  fetchIndexData,
  fetchInitialData,
  fetchRemainingData,
} from './fetchIndexData';
import handleData from './handleData';
import { notificationCenter } from '..';
import { ErrorParser } from '../../utils';
import PreloadPostsForGroupHandler from './preloadPostsForGroupHandler';
import { ERROR_TYPES } from '../../error';

type SyncListener = {
  onInitialLoaded?: (indexData: IndexDataModel) => Promise<void>;
  onInitialHandled?: () => Promise<void>;
  onRemainingLoaded?: (indexData: IndexDataModel) => Promise<void>;
  onRemainingHandled?: () => Promise<void>;
  onIndexLoaded?: (indexData: IndexDataModel) => Promise<void>;
  onIndexHandled?: () => Promise<void>;
};

export default class SyncService extends BaseService {
  private isLoading: boolean;
  private _syncListener: SyncListener;

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

  async syncData(syncListener?: SyncListener) {
    this._syncListener = syncListener || {};
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
    this._preloadPosts();
  }

  private async _preloadPosts() {
    const handler = new PreloadPostsForGroupHandler();
    handler.preloadPosts();
  }

  private async _firstLogin() {
    const {
      onInitialLoaded,
      onInitialHandled,
      onRemainingLoaded,
      onRemainingHandled,
    } = this._syncListener;

    try {
      const currentTime = Date.now();
      const initialResult = await fetchInitialData(currentTime);

      if (initialResult.isOk()) {
        onInitialLoaded && (await onInitialLoaded(initialResult.data));
        await handleData(initialResult.data);
        onInitialHandled && (await onInitialHandled());

        const remainingResult = await fetchRemainingData(currentTime);

        if (remainingResult.isOk()) {
          onRemainingLoaded && (await onRemainingLoaded(remainingResult.data));
          await handleData(remainingResult.data);
          onRemainingHandled && (await onRemainingHandled());
          mainLogger.info('fetch initial data or remaining data success');
          return;
        }
      }

      mainLogger.error('fetch initial data or remaining data error');
      notificationCenter.emitKVChange(SERVICE.DO_SIGN_OUT);
    } catch (e) {
      mainLogger.error('fetch initial data or remaining data error');
      notificationCenter.emitKVChange(SERVICE.DO_SIGN_OUT);
    }
  }

  private async _syncIndexData(timeStamp: number) {
    const { onIndexLoaded, onIndexHandled } = this._syncListener;
    // 5 minutes ago to ensure data is correct
    const result = await fetchIndexData(String(timeStamp - 300000));
    if (result.isOk()) {
      onIndexLoaded && (await onIndexLoaded(result.data));
      await handleData(result.data);
      onIndexHandled && (await onIndexHandled());
    } else {
      this._handleSyncIndexError(result.error);
    }
  }

  private async _handleSyncIndexError(result: any) {
    const error = ErrorParser.parse(result);
    if (error.isMatch({ type: ERROR_TYPES.NETWORK, codes: [ERROR_CODES_NETWORK.GATEWAY_TIMEOUT] })) {
      notificationCenter.emitKVChange(SERVICE.SYNC_SERVICE.START_CLEAR_DATA);
      await this._handle504GateWayError();
      notificationCenter.emitKVChange(SERVICE.SYNC_SERVICE.END_CLEAR_DATA);
    }
  }

  private async _handle504GateWayError() {
    // clear data
    const configDao = daoManager.getKVDao(ConfigDao);
    configDao.put(LAST_INDEX_TIMESTAMP, '');
    const itemDao = daoManager.getDao(ItemDao);
    await itemDao.clear();
    const postDao = daoManager.getDao(PostDao);
    await postDao.clear();
    const groupDao = daoManager.getDao(GroupDao);
    await groupDao.clear();
    const personDao = daoManager.getDao(PersonDao);
    await personDao.clear();

    await this._firstLogin();
  }
}
