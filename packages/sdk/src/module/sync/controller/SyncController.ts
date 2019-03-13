/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2019-02-25 13:22:12
 * Copyright © RingCentral. All rights reserved.
 */

import { IndexDataModel } from '../../../api/glip/user';

import { indexData, initialData, remainingData } from '../../../api';
import accountHandleData from '../../../service/account/handleData';

import { SERVICE, CONFIG } from '../../../service/eventKey';
import { progressBar } from '../../../utils/progress';
import { mainLogger, ERROR_CODES_NETWORK } from 'foundation';
import notificationCenter from '../../../service/notificationCenter';
import { ErrorParserHolder } from '../../../error/ErrorParserHolder';
import { ERROR_TYPES } from '../../../error/types';
import { Profile } from '../../profile/entity';
import { Raw } from '../../../framework/model';
import { CompanyService } from '../../company';
import { ItemService } from '../../item/service';
import { PresenceService } from '../../presence';
import { StateService } from '../../state';
import { ProfileService } from '../../profile';
import { PersonService } from '../../person';
import { GroupService } from '../../group';
import { PostService } from '../../post';
import { SyncListener } from '../service/SyncListener';
import { NewGlobalConfig } from '../../../service/config/NewGlobalConfig';

class SyncController {
  private _syncListener: SyncListener;

  constructor() {}

  handleSocketConnectionStateChanged({ state }: { state: any }) {
    mainLogger.log('sync service SERVICE.SOCKET_STATE_CHANGE', state);
    if (state === 'connected' || state === 'refresh') {
      this.syncData();
    } else if (state === 'connecting') {
      progressBar.start();
    } else if (state === 'disconnected') {
      progressBar.stop();
    }
  }

  getIndexTimestamp() {
    return NewGlobalConfig.getLastIndexTimestamp();
  }

  async syncData(syncListener?: SyncListener) {
    this._syncListener = syncListener || {};
    const lastIndexTimestamp = this.getIndexTimestamp();
    mainLogger.log('start syncData time: ', lastIndexTimestamp);
    try {
      if (lastIndexTimestamp) {
        await this._syncIndexData(lastIndexTimestamp);
        this._checkFetchedRemaining(lastIndexTimestamp);
      } else {
        await this._firstLogin();
      }
    } catch (e) {
      mainLogger.log('syncData fail', e);
    }
  }

  private async _firstLogin() {
    progressBar.start();
    try {
      const currentTime = Date.now();
      await this._fetchInitial(currentTime);
      await this._fetchRemaining(currentTime);
      mainLogger.info('fetch initial data or remaining data success');
    } catch (e) {
      mainLogger.error('fetch initial data or remaining data error');
      // actually, should only do sign out when initial failed
      notificationCenter.emitKVChange(SERVICE.DO_SIGN_OUT);
    }
    progressBar.stop();
  }

  private async _fetchInitial(time: number) {
    const { onInitialLoaded, onInitialHandled } = this._syncListener;
    const initialResult = await this.fetchInitialData(time);
    onInitialLoaded && (await onInitialLoaded(initialResult));
    await this._handleIncomingData(initialResult);
    notificationCenter.emitKVChange(SERVICE.FETCH_INITIAL_DONE);
    onInitialHandled && (await onInitialHandled());
    mainLogger.log('fetch initial data and handle success');
  }

  private async _checkFetchedRemaining(time: number) {
    if (!NewGlobalConfig.getFetchedRemaining()) {
      try {
        this._fetchRemaining(time);
      } catch (e) {
        mainLogger.error('fetch remaining data error');
      }
    }
  }

  private async _fetchRemaining(time: number) {
    const { onRemainingLoaded, onRemainingHandled } = this._syncListener;
    const remainingResult = await this.fetchRemainingData(time);
    onRemainingLoaded && (await onRemainingLoaded(remainingResult));
    await this._handleIncomingData(remainingResult);
    onRemainingHandled && (await onRemainingHandled());
    NewGlobalConfig.setFetchedRemaining(true);
    mainLogger.log('fetch remaining data and handle success');
  }

  private async _syncIndexData(timeStamp: number) {
    progressBar.start();
    const { onIndexLoaded, onIndexHandled } = this._syncListener;
    // 5 minutes ago to ensure data is correct
    let result;
    try {
      result = await this.fetchIndexData(String(timeStamp - 300000));
      onIndexLoaded && (await onIndexLoaded(result));
      await this._handleIncomingData(result);
      onIndexHandled && (await onIndexHandled());
    } catch (error) {
      this._handleSyncIndexError(error);
    }
    progressBar.stop();
  }

  private async _handleSyncIndexError(result: any) {
    const error = ErrorParserHolder.getErrorParser().parse(result);
    if (
      error.isMatch({
        type: ERROR_TYPES.NETWORK,
        codes: [ERROR_CODES_NETWORK.GATEWAY_TIMEOUT],
      })
    ) {
      notificationCenter.emitKVChange(SERVICE.SYNC_SERVICE.START_CLEAR_DATA);
      await this._handle504GateWayError();
      notificationCenter.emitKVChange(SERVICE.SYNC_SERVICE.END_CLEAR_DATA);
    }
  }

  private async _handle504GateWayError() {
    // clear data
    NewGlobalConfig.setLastIndexTimestamp('');

    await Promise.all([
      ItemService.getInstance<ItemService>().clear(),
      PostService.getInstance<PostService>().clear(),
      GroupService.getInstance<GroupService>().clear(),
      PersonService.getInstance<PersonService>().clear(),
    ]);

    await this._firstLogin();
  }

  /* fetch initial/remaining/indexData apis */
  private _fetchData = (
    getDataFunction: (
      params: object,
      requestConfig?: object,
      headers?: object,
    ) => Promise<IndexDataModel>,
  ) => async (params: object) => {
    return await getDataFunction(params);
  }

  async fetchInitialData(currentTime: number) {
    return this._fetchData(initialData)({ _: currentTime });
  }

  async fetchRemainingData(currentTime: number) {
    return remainingData({ _: currentTime });
  }

  async fetchIndexData(timeStamp: string) {
    const params = { newer_than: timeStamp };
    notificationCenter.emitKVChange(SERVICE.FETCH_INDEX_DATA_EXIST);
    return this._fetchData(indexData)(params);
  }

  /* handle incoming data */
  private async _dispatchIncomingData(data: IndexDataModel) {
    const {
      user_id: userId,
      company_id: companyId,
      profile,
      companies = [],
      items = [],
      presences = [],
      state,
      people = [],
      groups = [],
      teams = [],
      posts = [],
      public_teams = [],
      max_posts_exceeded: maxPostsExceeded = false,
      client_config: clientConfig = {},
    } = data;

    const MergedGroups = groups.concat(teams, public_teams);

    const arrState: any[] = [];
    if (state && Object.keys(state).length > 0) {
      arrState.push(state);
      arrState[0].__from_index = true;
    }

    let transProfile: Raw<Profile> | null = null;
    if (profile && Object.keys(profile).length > 0) {
      transProfile = profile;
    }
    return Promise.all([
      accountHandleData({
        userId,
        companyId,
        clientConfig,
        profileId: profile ? profile._id : undefined,
      }),
      CompanyService.getInstance<CompanyService>().handleIncomingData(
        companies,
      ),
      (ItemService.getInstance() as ItemService).handleIncomingData(items),
      PresenceService.getInstance<PresenceService>().presenceHandleData(
        presences,
      ),
      (StateService.getInstance() as StateService).handleState(arrState),
    ])
      .then(() =>
        ProfileService.getInstance<ProfileService>().handleIncomingData(
          transProfile,
        ),
      )
      .then(() =>
        PersonService.getInstance<PersonService>().handleIncomingData(people),
      )
      .then(() =>
        GroupService.getInstance<GroupService>().handleData(MergedGroups),
      )
      .then(() =>
        PostService.getInstance<PostService>().handleIndexData(
          posts,
          maxPostsExceeded,
        ),
      );
  }

  private async _handleIncomingData(
    result: IndexDataModel,
    shouldSaveScoreboard: boolean = true,
  ) {
    try {
      const {
        timestamp = null,
        scoreboard = null,
        static_http_server: staticHttpServer = '',
      } = result;

      if (scoreboard && shouldSaveScoreboard) {
        NewGlobalConfig.setSocketServerHost(scoreboard);
        notificationCenter.emitKVChange(CONFIG.SOCKET_SERVER_HOST, scoreboard);
      }

      if (staticHttpServer) {
        NewGlobalConfig.setStaticHttpServer(staticHttpServer);
        notificationCenter.emitKVChange(
          CONFIG.STATIC_HTTP_SERVER,
          staticHttpServer,
        );
      }

      // logger.time('handle index data');
      await this._dispatchIncomingData(result);
      // logger.timeEnd('handle index data');
      if (timestamp) {
        NewGlobalConfig.setLastIndexTimestamp(timestamp);
        notificationCenter.emitKVChange(CONFIG.LAST_INDEX_TIMESTAMP, timestamp);
      }

      notificationCenter.emitKVChange(SERVICE.FETCH_INDEX_DATA_DONE);
    } catch (error) {
      mainLogger.error(`sync/handleData: ${JSON.stringify(error)}`);
      notificationCenter.emitKVChange(SERVICE.FETCH_INDEX_DATA_ERROR, {
        error: ErrorParserHolder.getErrorParser().parse(error),
      });
    }
  }
}

export { SyncController };
