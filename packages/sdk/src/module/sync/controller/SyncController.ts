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
import { GroupService, Group } from '../../group';
import { PostService } from '../../post';
import { SyncListener } from '../service/SyncListener';
import { NewGlobalConfig } from '../../../service/config/NewGlobalConfig';
import { SyncUserConfig } from '../config/SyncUserConfig';
// import { IndexRequestProcessor } from './IndexRequestProcessor';
// import { SequenceProcessorHandler } from '../../../framework/processor/SequenceProcessorHandler';
import { SYNC_SOURCE } from '../types';
import { AccountGlobalConfig } from '../../../service/account/config';
import { GroupConfigService } from '../../../module/groupConfig';
import { AccountService } from '../../../service/account/accountService';
import socketManager from '../../../service/socket';
import { Company } from '../../../module/company/entity';
import { PerformanceTracerHolder, PERFORMANCE_KEYS } from '../../../utils';
import { LOG_INDEX_DATA } from '../constant';
import { Item } from '../../../module/item/entity';
import { RawPresence } from '../../../module/presence/entity';
import { Person } from '../../../module/person/entity';
import { Post } from '../../../module/post/entity';

const LOG_TAG = 'SyncController';
class SyncController {
  private _syncListener: SyncListener;
  // private _processorHandler: SequenceProcessorHandler;

  constructor() {
    // this._processorHandler = new SequenceProcessorHandler(
    //   'Index_SyncController',
    // );
  }

  handleSocketConnectionStateChanged({ state }: { state: any }) {
    mainLogger.log(LOG_TAG, 'sync service SERVICE.SOCKET_STATE_CHANGE', state);
    if (state === 'connected' || state === 'refresh') {
      this.syncData();
    } else if (state === 'connecting') {
      progressBar.start();
    } else if (state === 'disconnected') {
      this.updateCanUpdateIndexTimeStamp(false);
      progressBar.stop();
    }
  }

  handleWindowFocused() {
    this._onPageFocused();
  }

  getIndexTimestamp() {
    if (AccountGlobalConfig.getUserDictionary()) {
      const syncConfig = new SyncUserConfig();
      return syncConfig.getLastIndexTimestamp();
    }
    return null;
  }

  updateIndexTimestamp(time: number, forceUpdate: boolean) {
    const syncConfig = new SyncUserConfig();
    if (forceUpdate) {
      const isConnected = socketManager.isConnected();
      mainLogger.log(
        LOG_TAG,
        `updateIndexTimestamp time: ${time} forceUpdate:${forceUpdate} socket is connected:${isConnected}`,
      );
      syncConfig.setLastIndexTimestamp(time);
      isConnected && this.updateCanUpdateIndexTimeStamp(true);
    } else if (this.canUpdateIndexTimeStamp()) {
      mainLogger.log(
        LOG_TAG,
        `updateIndexTimestamp time: ${time} forceUpdate:false`,
      );
      syncConfig.setLastIndexTimestamp(time);
    }
  }

  updateCanUpdateIndexTimeStamp(can: boolean) {
    mainLogger.log(LOG_TAG, 'updateCanUpdateIndexTimeStamp', can);
    const syncConfig = new SyncUserConfig();
    return syncConfig.updateCanUpdateIndexTimeStamp(can);
  }

  canUpdateIndexTimeStamp() {
    const syncConfig = new SyncUserConfig();
    return syncConfig.getCanUpdateIndexTimeStamp();
  }

  async syncData(syncListener?: SyncListener) {
    this._syncListener = syncListener || {};
    const lastIndexTimestamp = this.getIndexTimestamp();
    mainLogger.log(LOG_TAG, 'start syncData time: ', lastIndexTimestamp);
    try {
      if (lastIndexTimestamp) {
        await this._syncIndexData(lastIndexTimestamp);
        await this._checkFetchedRemaining(lastIndexTimestamp);
      } else {
        await this._firstLogin();
      }
    } catch (e) {
      mainLogger.log(LOG_TAG, 'syncData fail', e);
    }
  }

  handleStoppingSocketEvent() {
    // this is for update newer than tag
    mainLogger.log(LOG_TAG, 'handleStoppingSocketEvent');
    this._disableCanUpdateIndexTimeStampFlag();
  }

  handleWakeUpFromSleep() {
    mainLogger.log(LOG_TAG, 'handleWakeUpFromSleep');
    this._disableCanUpdateIndexTimeStampFlag();
  }

  private _disableCanUpdateIndexTimeStampFlag() {
    if (AccountGlobalConfig.getUserDictionary()) {
      this.updateCanUpdateIndexTimeStamp(false);
    }
  }

  private async _firstLogin() {
    progressBar.start();
    const currentTime = Date.now();
    try {
      await this._fetchInitial(currentTime);
      mainLogger.info(LOG_TAG, 'fetch initial data success');
      notificationCenter.emitKVChange(SERVICE.LOGIN);
    } catch (e) {
      mainLogger.error(LOG_TAG, 'fetch initial data error');
      // actually, should only do sign out when initial failed
      notificationCenter.emitKVChange(SERVICE.DO_SIGN_OUT);
    }
    try {
      await this._fetchRemaining(currentTime);
      mainLogger.info(LOG_TAG, 'fetch remaining data success');
    } catch (e) {
      mainLogger.error(LOG_TAG, 'fetch remaining data error');
    }
    progressBar.stop();
  }

  private async _fetchInitial(time: number) {
    const { onInitialLoaded, onInitialHandled } = this._syncListener;
    const initialResult = await this.fetchInitialData(time);
    onInitialLoaded && (await onInitialLoaded(initialResult));
    await this._handleIncomingData(initialResult, SYNC_SOURCE.INITIAL);
    onInitialHandled && (await onInitialHandled());
    mainLogger.log(LOG_TAG, 'fetch initial data and handle success');
  }

  private async _checkFetchedRemaining(time: number) {
    const syncConfig = new SyncUserConfig();
    if (!syncConfig.getFetchedRemaining()) {
      try {
        await this._fetchRemaining(time);
      } catch (e) {
        mainLogger.error(LOG_TAG, 'fetch remaining data error');
      }
    }
  }

  private async _fetchRemaining(time: number) {
    mainLogger.log(LOG_TAG, 'start fetching remaining');
    const { onRemainingLoaded, onRemainingHandled } = this._syncListener;
    const remainingResult = await this.fetchRemainingData(time);
    onRemainingLoaded && (await onRemainingLoaded(remainingResult));
    await this._handleIncomingData(remainingResult, SYNC_SOURCE.REMAINING);
    onRemainingHandled && (await onRemainingHandled());
    const syncConfig = new SyncUserConfig();
    syncConfig.setFetchedRemaining(true);
    mainLogger.log('fetch remaining data and handle success');
  }

  private async _syncIndexData(timeStamp: number) {
    mainLogger.log(LOG_TAG, 'start fetching index');
    progressBar.start();
    const { onIndexLoaded, onIndexHandled } = this._syncListener;
    const syncConfig = new SyncUserConfig();
    // 5 minutes ago to ensure data is correct
    try {
      const result = await this.fetchIndexData(String(timeStamp - 300000));
      mainLogger.log(LOG_TAG, 'fetch index done');
      onIndexLoaded && (await onIndexLoaded(result));
      await this._handleIncomingData(result, SYNC_SOURCE.INDEX);
      onIndexHandled && (await onIndexHandled());
      syncConfig.updateIndexSucceed(true);
    } catch (error) {
      mainLogger.log(LOG_TAG, 'fetch index failed');
      this.updateCanUpdateIndexTimeStamp(false);
      syncConfig.updateIndexSucceed(false);
      await this._handleSyncIndexError(error);
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
    const syncConfig = new SyncUserConfig();
    syncConfig.setLastIndexTimestamp('');

    await Promise.all([
      ItemService.getInstance<ItemService>().clear(),
      PostService.getInstance<PostService>().clear(),
      GroupConfigService.getInstance<GroupConfigService>().clear(),
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
  private async _dispatchIncomingData(
    data: IndexDataModel,
    source: SYNC_SOURCE,
  ) {
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

    const mergedGroups = groups.concat(teams, public_teams);

    const arrState: any[] = [];
    if (state && Object.keys(state).length > 0) {
      arrState.push(state);
      arrState[0].__from_index = true;
    }

    let transProfile: Raw<Profile> | null = null;
    if (profile && Object.keys(profile).length > 0) {
      transProfile = profile;
    }
    return await Promise.all([
      accountHandleData({
        userId,
        companyId,
        clientConfig,
        profileId: profile ? profile._id : undefined,
      }),
      this._handleIncomingCompany(companies, source),
      this._handleIncomingItem(items, source),
      this._handleIncomingPresence(presences, source),
      this._handleIncomingState(arrState, source),
    ])
      .then(() => this._handleIncomingProfile(transProfile, source))
      .then(() => this._handleIncomingPerson(people, source))
      .then(() => this._handleIncomingGroup(mergedGroups, source))
      .then(() => this._handleIncomingPost(posts, maxPostsExceeded, source));
  }

  private async _handleIncomingCompany(
    companies: Raw<Company>[],
    source: SYNC_SOURCE,
  ) {
    mainLogger.info(
      LOG_INDEX_DATA,
      `_handleIncomingCompany() company.length: ${companies &&
        companies.length}, source: ${source}`,
    );
    const logId = Date.now();
    PerformanceTracerHolder.getPerformanceTracer().start(
      PERFORMANCE_KEYS.HANDLE_INCOMING_COMPANY,
      logId,
    );
    CompanyService.getInstance<CompanyService>().handleIncomingData(
      companies,
      source,
    );
    PerformanceTracerHolder.getPerformanceTracer().end(logId);
  }

  private async _handleIncomingItem(items: Raw<Item>[], source: SYNC_SOURCE) {
    mainLogger.info(
      LOG_INDEX_DATA,
      `_handleIncomingItem() item.length: ${items &&
        items.length}, source: ${source}`,
    );
    const logId = Date.now();
    PerformanceTracerHolder.getPerformanceTracer().start(
      PERFORMANCE_KEYS.HANDLE_INCOMING_ITEM,
      logId,
    );
    (ItemService.getInstance() as ItemService).handleIncomingData(items);
    PerformanceTracerHolder.getPerformanceTracer().end(logId);
  }

  private async _handleIncomingPresence(
    presences: RawPresence[],
    source: SYNC_SOURCE,
  ) {
    mainLogger.info(
      LOG_INDEX_DATA,
      `_handleIncomingPresence() item.length: ${presences &&
        presences.length}, source: ${source}`,
    );
    const logId = Date.now();
    PerformanceTracerHolder.getPerformanceTracer().start(
      PERFORMANCE_KEYS.HANDLE_INCOMING_PRESENCE,
      logId,
    );
    PresenceService.getInstance<PresenceService>().presenceHandleData(
      presences,
    );
    PerformanceTracerHolder.getPerformanceTracer().end(logId);
  }

  private async _handleIncomingState(states: any[], source: SYNC_SOURCE) {
    mainLogger.info(
      LOG_INDEX_DATA,
      `_handleIncomingState() states.length: ${states &&
        states.length}, source: ${source}`,
    );
    const logId = Date.now();
    PerformanceTracerHolder.getPerformanceTracer().start(
      PERFORMANCE_KEYS.HANDLE_INCOMING_STATE,
      logId,
    );
    (StateService.getInstance() as StateService).handleState(states, source);
    PerformanceTracerHolder.getPerformanceTracer().end(logId);
  }

  private async _handleIncomingProfile(
    profile: Raw<Profile> | null,
    source: SYNC_SOURCE,
  ) {
    mainLogger.info(
      LOG_INDEX_DATA,
      `_handleIncomingProfile(), source: ${source}`,
    );
    const logId = Date.now();
    PerformanceTracerHolder.getPerformanceTracer().start(
      PERFORMANCE_KEYS.HANDLE_INCOMING_PROFILE,
      logId,
    );
    ProfileService.getInstance<ProfileService>().handleIncomingData(
      profile,
      source,
    );
    PerformanceTracerHolder.getPerformanceTracer().end(logId);
  }

  private async _handleIncomingPerson(
    persons: Raw<Person>[],
    source: SYNC_SOURCE,
  ) {
    mainLogger.info(
      LOG_INDEX_DATA,
      `_handleIncomingPerson() persons.length: ${persons &&
        persons.length}, source: ${source}`,
    );
    const logId = Date.now();
    PerformanceTracerHolder.getPerformanceTracer().start(
      PERFORMANCE_KEYS.HANDLE_INCOMING_PERSON,
      logId,
    );
    PersonService.getInstance<PersonService>().handleIncomingData(
      persons,
      source,
    );
    PerformanceTracerHolder.getPerformanceTracer().end(logId);
  }

  private async _handleIncomingGroup(
    groups: Raw<Group>[],
    source: SYNC_SOURCE,
  ) {
    mainLogger.info(
      LOG_INDEX_DATA,
      `_handleIncomingGroup() groups.length: ${groups &&
        groups.length}, source: ${source}`,
    );
    const logId = Date.now();
    PerformanceTracerHolder.getPerformanceTracer().start(
      PERFORMANCE_KEYS.HANDLE_INCOMING_GROUP,
      logId,
    );
    GroupService.getInstance<GroupService>().handleData(groups, source);
    PerformanceTracerHolder.getPerformanceTracer().end(logId);
  }

  private async _handleIncomingPost(
    posts: Raw<Post>[],
    maxPostsExceeded: boolean,
    source: SYNC_SOURCE,
  ) {
    mainLogger.info(
      LOG_INDEX_DATA,
      `_handleIncomingPost() groups.length: ${posts &&
        posts.length}, source: ${source}`,
    );
    const logId = Date.now();
    PerformanceTracerHolder.getPerformanceTracer().start(
      PERFORMANCE_KEYS.HANDLE_INCOMING_GROUP,
      logId,
    );
    PostService.getInstance<PostService>().handleIndexData(
      posts,
      maxPostsExceeded,
    );
    PerformanceTracerHolder.getPerformanceTracer().end(logId);
  }

  private async _handleIncomingData(
    result: IndexDataModel,
    source: SYNC_SOURCE,
  ) {
    try {
      const {
        timestamp = null,
        scoreboard = null,
        static_http_server: staticHttpServer = '',
      } = result;

      await this._dispatchIncomingData(result, source);
      const shouldSaveTimeStamp =
        source === SYNC_SOURCE.INDEX || source === SYNC_SOURCE.INITIAL;
      if (timestamp && shouldSaveTimeStamp) {
        this.updateIndexTimestamp(timestamp, true);
        notificationCenter.emitKVChange(CONFIG.LAST_INDEX_TIMESTAMP, timestamp);
      }

      const shouldSaveScoreboard =
        scoreboard &&
        (source === SYNC_SOURCE.INDEX || source === SYNC_SOURCE.INITIAL);
      if (shouldSaveScoreboard) {
        const socketUserConfig = new SyncUserConfig();
        socketUserConfig.setSocketServerHost(scoreboard);
        notificationCenter.emitKVChange(CONFIG.SOCKET_SERVER_HOST, scoreboard);
      }

      if (staticHttpServer) {
        NewGlobalConfig.setStaticHttpServer(staticHttpServer);
        notificationCenter.emitKVChange(
          CONFIG.STATIC_HTTP_SERVER,
          staticHttpServer,
        );
      }
      notificationCenter.emitKVChange(SERVICE.FETCH_INDEX_DATA_DONE);
    } catch (error) {
      mainLogger.error(`sync/handleData: ${JSON.stringify(error)}`);
      notificationCenter.emitKVChange(SERVICE.FETCH_INDEX_DATA_ERROR, {
        error: ErrorParserHolder.getErrorParser().parse(error),
      });
    }
  }

  private async _onPageFocused() {
    this._checkIndex();
  }

  private async _checkIndex() {
    const accountService: AccountService = AccountService.getInstance();
    if (accountService.isGlipLogin()) {
      const socketUserConfig = new SyncUserConfig();
      const succeed = socketUserConfig.getIndexSucceed();

      if (!succeed) {
        mainLogger.info(LOG_TAG, ' _checkIndex, last index was not succeed');
        await this.syncData();
      }
    }
  }
}

export { SyncController };
