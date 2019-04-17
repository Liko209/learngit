/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2019-02-25 13:22:12
 * Copyright © RingCentral. All rights reserved.
 */

import { IndexDataModel } from '../../../api/glip/user';

import { indexData, initialData, remainingData } from '../../../api';
import { accountHandleData } from '../../../module/account/service';

import { SERVICE, CONFIG, ENTITY } from '../../../service/eventKey';
import { progressManager, ProgressBar } from '../../../utils/progress';
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
import { SyncUserConfig } from '../config/SyncUserConfig';
import { IndexRequestProcessor } from './IndexRequestProcessor';
import {
  SequenceProcessorHandler,
  IProcessor,
} from '../../../framework/processor';
import { SYNC_SOURCE } from '../types';
import { AccountGlobalConfig } from '../../../module/account/config';
import { GroupConfigService } from '../../../module/groupConfig';
import { ServiceLoader, ServiceConfig } from '../../../module/serviceLoader';
import { PerformanceTracerHolder, PERFORMANCE_KEYS } from '../../../utils';
import { AccountService } from '../../../module/account';
import { Company } from '../../../module/company/entity';
import { LOG_INDEX_DATA } from '../constant';
import { SyncGlobalConfig } from '../config';
import { Item } from '../../../module/item/entity';
import { RawPresence } from '../../../module/presence/entity';
import { Person } from '../../../module/person/entity';
import { Post } from '../../../module/post/entity';
import _ from 'lodash';

const LOG_TAG = 'SyncController';
const INDEX_MAX_QUEUE = 2;
class SyncController {
  private _isFetchingRemaining: boolean;
  private _syncListener: SyncListener;
  private _processorHandler: SequenceProcessorHandler;
  private _progressBar: ProgressBar;

  constructor() {
    this._progressBar = progressManager.newProgressBar();
    this._processorHandler = new SequenceProcessorHandler(
      'Index_SyncController',
      undefined,
      INDEX_MAX_QUEUE,
      this._onExceedMaxSize,
    );
  }

  private _onExceedMaxSize = (totalProcessors: IProcessor[]) => {
    mainLogger.log(
      `SequenceProcessorHandler-Index_SyncController over threshold:${INDEX_MAX_QUEUE}, remove the oldest one`,
    );
    const lastProcessor = totalProcessors.shift();
    if (lastProcessor && lastProcessor.cancel) {
      lastProcessor.cancel();
    }
  }

  handleSocketConnectionStateChanged({ state }: { state: any }) {
    mainLogger.log(LOG_TAG, 'sync service SERVICE.SOCKET_STATE_CHANGE', state);
    if (state === 'connected') {
      this._onSocketConnected();
    } else if (state === 'refresh') {
      this.syncData();
    } else if (state === 'connecting') {
      this._progressBar.start();
    } else if (state === 'disconnected') {
      this._onSocketDisconnected();
      this._progressBar.stop();
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

  async syncData(syncListener?: SyncListener) {
    this._syncListener = syncListener || {};
    const lastIndexTimestamp = this.getIndexTimestamp();
    mainLogger.log(LOG_TAG, `start syncData time: ${lastIndexTimestamp}`);
    try {
      if (lastIndexTimestamp) {
        await this._syncIndexData();
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
    this._resetSocketConnectedLocalTime();
  }

  handleWakeUpFromSleep() {
    mainLogger.log(LOG_TAG, 'handleWakeUpFromSleep');
    this._resetSocketConnectedLocalTime();
  }

  private async _firstLogin() {
    this._progressBar.start();
    const currentTime = Date.now();
    PerformanceTracerHolder.getPerformanceTracer().start(
      PERFORMANCE_KEYS.FIRST_LOGIN,
      currentTime,
    );
    try {
      await this._fetchInitial(currentTime);
      mainLogger.info(LOG_TAG, 'fetch initial data success');
      notificationCenter.emitKVChange(SERVICE.LOGIN);
    } catch (e) {
      mainLogger.error(LOG_TAG, 'fetch initial data error');
      // actually, should only do sign out when initial failed
      notificationCenter.emitKVChange(SERVICE.DO_SIGN_OUT);
    }
    this._checkFetchedRemaining(currentTime);
    PerformanceTracerHolder.getPerformanceTracer().end(currentTime);
    this._progressBar.stop();
  }

  private async _fetchInitial(time: number) {
    const { onInitialLoaded, onInitialHandled } = this._syncListener;
    const initialResult = await this.fetchInitialData(time);
    onInitialLoaded && (await onInitialLoaded(initialResult));

    const logId = Date.now();
    PerformanceTracerHolder.getPerformanceTracer().start(
      PERFORMANCE_KEYS.HANDLE_INITIAL_DATA,
      logId,
    );
    await this._handleIncomingData(initialResult, SYNC_SOURCE.INITIAL);
    PerformanceTracerHolder.getPerformanceTracer().end(logId);

    onInitialHandled && (await onInitialHandled());
    mainLogger.log(LOG_TAG, 'fetch initial data and handle success');
  }

  private async _checkFetchedRemaining(time: number) {
    const syncConfig = new SyncUserConfig();
    if (!syncConfig.getFetchedRemaining()) {
      try {
        if (this._isFetchingRemaining) {
          mainLogger.info(LOG_TAG, 'is fetching remaining data');
          return;
        }
        this._isFetchingRemaining = true;
        await this._fetchRemaining(time);
        mainLogger.info(LOG_TAG, 'fetch remaining data success');
      } catch (e) {
        this._isFetchingRemaining = false;
        mainLogger.error(LOG_TAG, 'fetch remaining data error');
      }
    }
  }

  private async _fetchRemaining(time: number) {
    mainLogger.log(LOG_TAG, 'start fetching remaining');
    const { onRemainingLoaded, onRemainingHandled } = this._syncListener;
    const remainingResult = await this.fetchRemainingData(time);
    onRemainingLoaded && (await onRemainingLoaded(remainingResult));

    const logId = Date.now();
    PerformanceTracerHolder.getPerformanceTracer().start(
      PERFORMANCE_KEYS.HANDLE_REMAINING_DATA,
      logId,
    );
    await this._handleIncomingData(remainingResult, SYNC_SOURCE.REMAINING);
    PerformanceTracerHolder.getPerformanceTracer().end(logId);

    onRemainingHandled && (await onRemainingHandled());
    mainLogger.log('fetch remaining data and handle success');
    const syncConfig = new SyncUserConfig();
    syncConfig.setFetchedRemaining(true);
  }

  private async _syncIndexData() {
    const executeFunc = async () => {
      const timeStamp = this.getIndexTimestamp();
      mainLogger.log(LOG_TAG, `start fetching index:${timeStamp}`);
      this._progressBar.start();
      const { onIndexLoaded, onIndexHandled } = this._syncListener;
      const syncConfig = new SyncUserConfig();
      // 5 minutes ago to ensure data is correct
      try {
        const result = await this.fetchIndexData(String(1543622400000));
        mainLogger.log(LOG_INDEX_DATA, 'fetch index done');
        onIndexLoaded && (await onIndexLoaded(result));

        const logId = Date.now();
        PerformanceTracerHolder.getPerformanceTracer().start(
          PERFORMANCE_KEYS.HANDLE_INDEX_DATA,
          logId,
        );
        await this._handleIncomingData(result, SYNC_SOURCE.INDEX);
        PerformanceTracerHolder.getPerformanceTracer().end(logId);

        onIndexHandled && (await onIndexHandled());
        syncConfig.updateIndexSucceed(true);
        mainLogger.log(LOG_INDEX_DATA, 'handle index done');
      } catch (error) {
        mainLogger.log(LOG_INDEX_DATA, 'fetch index failed');
        syncConfig.updateIndexSucceed(false);
        await this._handleSyncIndexError(error);
      }
      this._progressBar.stop();
    };
    const processor = new IndexRequestProcessor(executeFunc);
    this._processorHandler.addProcessor(processor);
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
      ServiceLoader.getInstance<ItemService>(
        ServiceConfig.ITEM_SERVICE,
      ).clear(),
      ServiceLoader.getInstance<PostService>(
        ServiceConfig.POST_SERVICE,
      ).clear(),
      ServiceLoader.getInstance<GroupConfigService>(
        ServiceConfig.GROUP_CONFIG_SERVICE,
      ).clear(),
      ServiceLoader.getInstance<GroupService>(
        ServiceConfig.GROUP_SERVICE,
      ).clear(),
      ServiceLoader.getInstance<PersonService>(
        ServiceConfig.PERSON_SERVICE,
      ).clear(),
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
    const entityMap = new Map<string, any[]>();
    const start = Date.now();
    await Promise.all([
      accountHandleData({
        userId,
        companyId,
        clientConfig,
        profileId: profile ? profile._id : undefined,
      }),
      this._handleIncomingCompany(companies, source, entityMap),
      this._handleIncomingItem(items, source, entityMap),
      this._handleIncomingPresence(presences, source, entityMap),
      this._handleIncomingState(arrState, source),
    ])
      .then(() => this._handleIncomingProfile(transProfile, source, entityMap))
      .then(() => this._handleIncomingPerson(people, source, entityMap))
      .then(() => this._handleIncomingGroup(mergedGroups, source, entityMap))
      .then(() =>
        this._handleIncomingPost(posts, maxPostsExceeded, source, entityMap),
      )
      .then(() => {
        mainLogger.debug(
          LOG_INDEX_DATA,
          `store index data done===${Date.now() - start}`,
        );
      })
      .then(() => {
        if (entityMap.size > 0) {
          const s = Date.now();
          entityMap.forEach((value: any[], key: string) => {
            if (key === ENTITY.GROUP_STATE || ENTITY.MY_STATE) {
              notificationCenter.emitEntityUpdate(key, value, value);
            } else {
              notificationCenter.emitEntityUpdate(key, value);
            }
          });
          mainLogger.debug(
            LOG_INDEX_DATA,
            `emit index data done===${Date.now() - s}`,
          );
        }
      });
  }

  private async _handleIncomingCompany(
    companies: Raw<Company>[],
    source: SYNC_SOURCE,
    entities?: Map<string, any[]>,
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
    await ServiceLoader.getInstance<CompanyService>(
      ServiceConfig.COMPANY_SERVICE,
    ).handleIncomingData(companies, source, entities);
    PerformanceTracerHolder.getPerformanceTracer().end(
      logId,
      companies && companies.length,
    );
  }

  private async _handleIncomingItem(
    items: Raw<Item>[],
    source: SYNC_SOURCE,
    entities?: Map<string, any[]>,
  ) {
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
    await ServiceLoader.getInstance<ItemService>(
      ServiceConfig.ITEM_SERVICE,
    ).handleIncomingData(items, entities);
    PerformanceTracerHolder.getPerformanceTracer().end(
      logId,
      items && items.length,
    );
  }

  private async _handleIncomingPresence(
    presences: RawPresence[],
    source: SYNC_SOURCE,
    entities?: Map<string, any[]>,
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
    await ServiceLoader.getInstance<PresenceService>(
      ServiceConfig.PRESENCE_SERVICE,
    ).presenceHandleData(presences, entities);
    PerformanceTracerHolder.getPerformanceTracer().end(
      logId,
      presences && presences.length,
    );
  }

  private async _handleIncomingState(
    states: any[],
    source: SYNC_SOURCE,
    entities?: Map<string, any[]>,
  ) {
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
    await ServiceLoader.getInstance<StateService>(
      ServiceConfig.STATE_SERVICE,
    ).handleState(states, source, entities);
    PerformanceTracerHolder.getPerformanceTracer().end(
      logId,
      states && states.length,
    );
  }

  private async _handleIncomingProfile(
    profile: Raw<Profile> | null,
    source: SYNC_SOURCE,
    entities?: Map<string, any[]>,
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
    await ServiceLoader.getInstance<ProfileService>(
      ServiceConfig.PROFILE_SERVICE,
    ).handleIncomingData(profile, source, entities);
    PerformanceTracerHolder.getPerformanceTracer().end(logId);
  }

  private async _handleIncomingPerson(
    persons: Raw<Person>[],
    source: SYNC_SOURCE,
    entities?: Map<string, any[]>,
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
    await ServiceLoader.getInstance<PersonService>(
      ServiceConfig.PERSON_SERVICE,
    ).handleIncomingData(persons, source, entities);
    PerformanceTracerHolder.getPerformanceTracer().end(
      logId,
      persons && persons.length,
    );
  }

  private async _handleIncomingGroup(
    groups: Raw<Group>[],
    source: SYNC_SOURCE,
    entities?: Map<string, any[]>,
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
    await ServiceLoader.getInstance<GroupService>(
      ServiceConfig.GROUP_SERVICE,
    ).handleData(groups, source, entities);
    PerformanceTracerHolder.getPerformanceTracer().end(
      logId,
      groups && groups.length,
    );
  }

  private async _handleIncomingPost(
    posts: Raw<Post>[],
    maxPostsExceeded: boolean,
    source: SYNC_SOURCE,
    entities?: Map<string, any[]>,
  ) {
    mainLogger.info(
      LOG_INDEX_DATA,
      `_handleIncomingPost() posts.length: ${posts &&
        posts.length}, source: ${source}`,
    );
    const logId = Date.now();
    PerformanceTracerHolder.getPerformanceTracer().start(
      PERFORMANCE_KEYS.HANDLE_INCOMING_POST,
      logId,
    );
    await ServiceLoader.getInstance<PostService>(
      ServiceConfig.POST_SERVICE,
    ).handleIndexData(posts, maxPostsExceeded, entities);
    PerformanceTracerHolder.getPerformanceTracer().end(
      logId,
      posts && posts.length,
    );
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
      }

      const shouldSaveScoreboard =
        source === SYNC_SOURCE.INDEX || source === SYNC_SOURCE.INITIAL;
      if (shouldSaveScoreboard && scoreboard) {
        this._updateIndexSocketAddress(scoreboard);
      }

      if (staticHttpServer) {
        SyncGlobalConfig.setStaticHttpServer(staticHttpServer);
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

  private _updateIndexSocketAddress(scoreboard: string) {
    const socketUserConfig = new SyncUserConfig();
    const oldValue = socketUserConfig.getIndexSocketServerHost();
    if (oldValue !== scoreboard) {
      socketUserConfig.setIndexSocketServerHost(scoreboard);
      notificationCenter.emitKVChange(
        CONFIG.INDEX_SOCKET_SERVER_HOST,
        scoreboard,
      );
    }
  }

  private async _onPageFocused() {
    this._checkIndex();
  }

  private async _checkIndex() {
    const accountService = ServiceLoader.getInstance<AccountService>(
      ServiceConfig.ACCOUNT_SERVICE,
    );
    if (accountService.isGlipLogin()) {
      const socketUserConfig = new SyncUserConfig();
      const succeed = socketUserConfig.getIndexSucceed();

      if (!succeed) {
        mainLogger.info(LOG_TAG, ' _checkIndex, last index was not succeed');
        await this.syncData();
      }
    }
  }

  /**
   * update index timestamp related functions
   *
   * 1. index request local time should larger than socket connected local time
   * 2. reset socket connected time to 0 once it disconnected
   */

  // index/initial ==> forceUpdate ==> true
  // socket ==> forceUpdate ==> false
  updateIndexTimestamp(time: number, forceUpdate: boolean) {
    const syncConfig = new SyncUserConfig();
    if (forceUpdate) {
      mainLogger.log(
        LOG_TAG,
        `updateIndexTimestamp time: ${time} forceUpdate:${forceUpdate}`,
      );
      syncConfig.setLastIndexTimestamp(time);
    } else if (this.canUpdateIndexTimeStamp()) {
      mainLogger.log(
        LOG_TAG,
        `updateIndexTimestamp time: ${time} forceUpdate:false`,
      );
      syncConfig.setLastIndexTimestamp(time);
    }
  }

  canUpdateIndexTimeStamp() {
    const syncConfig = new SyncUserConfig();
    const socketTime = syncConfig.getSocketConnectedLocalTime();
    const indexTime = syncConfig.getIndexStartLocalTime();
    return socketTime && indexTime > socketTime;
  }

  private _onSocketDisconnected() {
    this._resetSocketConnectedLocalTime();
  }
  private _onSocketConnected() {
    this._updateSocketConnectedLocalTime(Date.now());
    this.syncData();
  }

  private _resetSocketConnectedLocalTime() {
    if (AccountGlobalConfig.getUserDictionary()) {
      mainLogger.info(LOG_TAG, 'reset socket connected time');
      this._updateSocketConnectedLocalTime(0);
    }
  }

  private _updateSocketConnectedLocalTime(time: number) {
    const syncUserConfig = new SyncUserConfig();
    syncUserConfig.setSocketConnectedLocalTime(time);
  }
}

export { SyncController };
