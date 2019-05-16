/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2019-02-25 13:22:12
 * Copyright © RingCentral. All rights reserved.
 */

import { ERROR_CODES_NETWORK, mainLogger } from 'foundation';
import { TaskController } from 'sdk/framework/controller/impl/TaskController';
import { ITaskStrategy } from 'sdk/framework/strategy/ITaskStrategy';
import { indexData, initialData, remainingData } from '../../../api';
import { IndexDataModel } from '../../../api/glip/user';
import { ErrorParserHolder } from '../../../error/ErrorParserHolder';
import { ERROR_TYPES } from '../../../error/types';
import { Raw } from '../../../framework/model';
import { AccountService } from '../../../module/account';
import { AccountGlobalConfig } from '../../../module/account/config';
import { accountHandleData } from '../../../module/account/service';
import { Company } from '../../../module/company/entity';
import { Item } from '../../../module/item/entity';
import { Person } from '../../../module/person/entity';
import { Post } from '../../../module/post/entity';
import { RawPresence } from '../../../module/presence/entity';
import { ServiceConfig, ServiceLoader } from '../../../module/serviceLoader';
import { CONFIG, SERVICE } from '../../../service/eventKey';
import notificationCenter from '../../../service/notificationCenter';
import { PerformanceTracer, PERFORMANCE_KEYS } from '../../../utils';
import { ProgressBar, progressManager } from '../../../utils/progress';
import { CompanyService } from '../../company';
import { Group, GroupService } from '../../group';
import { ItemService } from '../../item/service';
import { PersonService } from '../../person';
import { PostService } from '../../post';
import { PresenceService } from '../../presence';
import { ProfileService } from '../../profile';
import { Profile } from '../../profile/entity';
import { StateService } from '../../state';
import { SyncGlobalConfig } from '../config';
import { LOG_INDEX_DATA } from '../constant';
import { SyncListener, SyncService } from '../service';
import { IndexDataTaskStrategy } from '../strategy/IndexDataTaskStrategy';
import { ChangeModel, SYNC_SOURCE } from '../types';
import { DaoGlobalConfig } from 'sdk/dao/config';
import { LogControlManager } from 'sdk/service/uploadLogControl';
import { Nullable, IHealthStatusItem } from 'sdk/types';
import { toString, InformationRecorder, AbstractRecord } from 'sdk/utils';
import _ from 'lodash';

const LOG_TAG = 'SyncController';

type RequestStatus = 'none' | 'executing' | 'success' | 'failed';

class SyncController {
  private _isFetchingRemaining: boolean;
  private _syncListener: SyncListener;
  private _progressBar: ProgressBar;
  private _indexDataTaskController: TaskController;
  // private _lastSyncStatus: 'none' | 'success' | 'failed' = 'none';
  private _syncHealthStatusItem: IHealthStatusItem;
  private _lastSyncStatusRecorder: InformationRecorder<{
    lastIndexTimestamp: Nullable<number>;
    initial: RequestStatus;
    index: RequestStatus;
    remaining: RequestStatus;
    infos: Nullable<any[]>;
  }> = new InformationRecorder(
    () =>
      new AbstractRecord({
        lastIndexTimestamp: null,
        sync: 'none',
        initial: 'none',
        index: 'none',
        remaining: 'none',
      }),
    () => {
      mainLogger
        .tags('[HealthStatus]', '[PreSyncStatus]')
        .log(toString(this._lastSyncStatusRecorder.getLastRecord()));
    },
  );

  constructor() {
    this._progressBar = progressManager.newProgressBar();
    const LAST_SYNC_STATUS_NAME = 'LastSyncStatus';
    this._syncHealthStatusItem = {
      getName: () => {
        return LAST_SYNC_STATUS_NAME;
      },
      getStatus: async () => {
        return `${toString({
          preSyncStatus: this._lastSyncStatusRecorder.getLastRecord(),
          curSyncStatus: this._lastSyncStatusRecorder.getCurrentRecord(),
        })}`;
      },
    };
    LogControlManager.instance().unRegisterHealthStatusItem(
      LAST_SYNC_STATUS_NAME,
    );
    LogControlManager.instance().registerHealthStatusItem(
      this._syncHealthStatusItem,
    );
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
      const syncConfig = ServiceLoader.getInstance<SyncService>(
        ServiceConfig.SYNC_SERVICE,
      ).userConfig;
      return syncConfig.getLastIndexTimestamp();
    }
    return null;
  }

  async syncData(syncListener?: SyncListener) {
    this._syncListener = syncListener || {};
    const lastIndexTimestamp = this.getIndexTimestamp();
    mainLogger.log(LOG_TAG, `start syncData time: ${lastIndexTimestamp}`);
    try {
      this._lastSyncStatusRecorder.startTransaction();
      this._lastSyncStatusRecorder.set(
        'lastIndexTimestamp',
        lastIndexTimestamp,
      );
      if (lastIndexTimestamp) {
        await this._syncIndexData();
        await this._checkFetchedRemaining(lastIndexTimestamp);
      } else {
        await this._firstLogin();
      }
    } catch (error) {
      this._lastSyncStatusRecorder.set('infos', ['syncData failed', { error }]);
      mainLogger.log(LOG_TAG, 'syncData fail', error);
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
    this._lastSyncStatusRecorder.set('infos', ['firstLogin flow start']);
    const performanceTracer = PerformanceTracer.initial();
    const currentTime = Date.now();
    try {
      await this._fetchInitial(currentTime);
      mainLogger.info(LOG_TAG, 'fetch initial data success');
      notificationCenter.emitKVChange(SERVICE.LOGIN);
    } catch (error) {
      mainLogger.error(LOG_TAG, 'fetch initial data error, force logout');
      this._lastSyncStatusRecorder.set('infos', [
        'firstLogin flow error',
        { error },
      ]);
      notificationCenter.emitKVChange(SERVICE.DO_SIGN_OUT);
    }
    this._checkFetchedRemaining(currentTime);
    performanceTracer.end({ key: PERFORMANCE_KEYS.FIRST_LOGIN });
    this._progressBar.stop();
    this._lastSyncStatusRecorder.set('infos', ['firstLogin flow end']);
  }

  private async _fetchInitial(time: number) {
    this._lastSyncStatusRecorder
      .set('initial', 'executing')
      .set('infos', ['_fetchInitial flow start']);
    const { onInitialLoaded, onInitialHandled } = this._syncListener;
    const initialResult = await this.fetchInitialData(time);
    onInitialLoaded && (await onInitialLoaded(initialResult));

    const performanceTracer = PerformanceTracer.initial();
    await this._handleIncomingData(initialResult, SYNC_SOURCE.INITIAL);
    performanceTracer.end({ key: PERFORMANCE_KEYS.HANDLE_INITIAL_DATA });

    onInitialHandled && (await onInitialHandled());
    mainLogger.log(LOG_TAG, 'fetch initial data and handle success');
    this._lastSyncStatusRecorder
      .set('initial', 'success')
      .set('infos', ['_fetchInitial flow success']);
  }

  private async _checkFetchedRemaining(time: number) {
    this._lastSyncStatusRecorder.set('infos', [
      '_checkFetchedRemaining flow start',
    ]);
    const syncConfig = ServiceLoader.getInstance<SyncService>(
      ServiceConfig.SYNC_SERVICE,
    ).userConfig;
    if (!syncConfig.getFetchedRemaining()) {
      try {
        if (this._isFetchingRemaining) {
          mainLogger.info(LOG_TAG, 'is fetching remaining data');
          return;
        }
        this._isFetchingRemaining = true;
        await this._fetchRemaining(time);
        mainLogger.info(LOG_TAG, 'fetch remaining data success');
        this._lastSyncStatusRecorder.set('infos', [
          '_checkFetchedRemaining flow success',
        ]);
      } catch (error) {
        this._isFetchingRemaining = false;
        this._lastSyncStatusRecorder
          .set('remaining', 'failed')
          .set('infos', [['_checkFetchedRemaining flow failed', { error }]]);
        mainLogger.error(LOG_TAG, 'fetch remaining data error');
      }
    } else {
      this._lastSyncStatusRecorder.set('infos', [
        '_checkFetchedRemaining flow end',
      ]);
    }
  }

  private async _fetchRemaining(time: number) {
    mainLogger.log(LOG_TAG, 'start fetching remaining');
    this._lastSyncStatusRecorder
      .set('remaining', 'executing')
      .set('infos', ['remaining flow start']);
    const { onRemainingLoaded, onRemainingHandled } = this._syncListener;
    const remainingResult = await this.fetchRemainingData(time);
    onRemainingLoaded && (await onRemainingLoaded(remainingResult));

    const performanceTracer = PerformanceTracer.initial();
    await this._handleIncomingData(remainingResult, SYNC_SOURCE.REMAINING);
    performanceTracer.end({ key: PERFORMANCE_KEYS.HANDLE_REMAINING_DATA });

    onRemainingHandled && (await onRemainingHandled());
    mainLogger.log('fetch remaining data and handle success');
    const syncConfig = ServiceLoader.getInstance<SyncService>(
      ServiceConfig.SYNC_SERVICE,
    ).userConfig;
    syncConfig.setFetchedRemaining(true);
    this._lastSyncStatusRecorder
      .set('remaining', 'success')
      .set('infos', ['remaining flow success']);
  }

  private async _syncIndexData() {
    const executeFunc = async () => {
      this._lastSyncStatusRecorder.set('infos', ['index flow start']);
      const timeStamp = this.getIndexTimestamp();
      mainLogger.log(LOG_TAG, `start fetching index:${timeStamp}`);
      this._progressBar.start();
      const { onIndexLoaded, onIndexHandled } = this._syncListener;
      const syncConfig = ServiceLoader.getInstance<SyncService>(
        ServiceConfig.SYNC_SERVICE,
      ).userConfig;
      // 5 minutes ago to ensure data is correct
      try {
        this._lastSyncStatusRecorder.set('index', 'executing');
        const result = await this.fetchIndexData(String(timeStamp - 300000));
        this._lastSyncStatusRecorder.set('index', 'success');
        mainLogger.log(LOG_INDEX_DATA, 'fetch index done');
        onIndexLoaded && (await onIndexLoaded(result));

        const performanceTracer = PerformanceTracer.initial();
        await this._handleIncomingData(result, SYNC_SOURCE.INDEX);
        performanceTracer.end({ key: PERFORMANCE_KEYS.HANDLE_INDEX_DATA });

        onIndexHandled && (await onIndexHandled());
        syncConfig.updateIndexSucceed(true);
        mainLogger.log(LOG_INDEX_DATA, 'handle index done');
        this._lastSyncStatusRecorder.set('infos', ['index flow success']);
      } catch (error) {
        this._lastSyncStatusRecorder
          .set('index', 'failed')
          .set('infos', ['index flow failed', { error }]);
        mainLogger.log(LOG_INDEX_DATA, 'fetch index failed');
        syncConfig.updateIndexSucceed(false);
        await this._handleSyncIndexError(error);
        throw new Error(error);
      }
      this._progressBar.stop();
    };
    const taskController = this._getIndexDataTaskController(executeFunc);
    taskController.start();
  }

  private _getIndexDataTaskController(executeFunc: () => any) {
    if (!this._indexDataTaskController) {
      const taskStrategy: ITaskStrategy = new IndexDataTaskStrategy();
      this._indexDataTaskController = new TaskController(
        taskStrategy,
        executeFunc,
      );
    }
    return this._indexDataTaskController;
  }

  private async _handleSyncIndexError(result: any) {
    const error = ErrorParserHolder.getErrorParser().parse(result);
    if (
      error.isMatch({
        type: ERROR_TYPES.NETWORK,
        codes: [ERROR_CODES_NETWORK.GATEWAY_TIMEOUT],
      })
    ) {
      await this._handle504GateWayError();
      notificationCenter.emitKVChange(SERVICE.RELOAD);
    }
  }

  private async _handle504GateWayError() {
    // remove DB version
    DaoGlobalConfig.removeDBSchemaVersion();
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
    const changeMap = new Map<string, ChangeModel>();
    const start = Date.now();
    await Promise.all([
      accountHandleData({
        userId,
        companyId,
        clientConfig,
        profileId: profile ? profile._id : undefined,
      }),
      this._handleIncomingCompany(companies, source, changeMap),
      this._handleIncomingItem(items, source, changeMap),
      this._handleIncomingPresence(presences, source, changeMap),
      this._handleIncomingState(arrState, source),
    ])
      .then(() => this._handleIncomingProfile(transProfile, source, changeMap))
      .then(() => this._handleIncomingPerson(people, source, changeMap))
      .then(() => this._handleIncomingGroup(mergedGroups, source, changeMap))
      .then(() =>
        this._handleIncomingPost(posts, maxPostsExceeded, source, changeMap),
      )
      .then(() => {
        mainLogger.debug(
          LOG_INDEX_DATA,
          `store index data done===${Date.now() - start}`,
        );
      })
      .then(() => {
        if (changeMap.size > 0) {
          const s = Date.now();
          changeMap.forEach((value: ChangeModel, key: string) => {
            if (value.partials) {
              notificationCenter.emitEntityUpdate(
                key,
                value.entities,
                value.partials,
              );
            } else {
              notificationCenter.emitEntityUpdate(key, value.entities);
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
    changeMap?: Map<string, ChangeModel>,
  ) {
    mainLogger.info(
      LOG_INDEX_DATA,
      `_handleIncomingCompany() company.length: ${companies &&
        companies.length}, source: ${source}`,
    );
    const performanceTracer = PerformanceTracer.initial();
    await ServiceLoader.getInstance<CompanyService>(
      ServiceConfig.COMPANY_SERVICE,
    ).handleIncomingData(companies, source, changeMap);
    performanceTracer.end({
      key: PERFORMANCE_KEYS.HANDLE_INCOMING_COMPANY,
      count: companies && companies.length,
    });
  }

  private async _handleIncomingItem(
    items: Raw<Item>[],
    source: SYNC_SOURCE,
    changeMap?: Map<string, ChangeModel>,
  ) {
    mainLogger.info(
      LOG_INDEX_DATA,
      `_handleIncomingItem() item.length: ${items &&
        items.length}, source: ${source}`,
    );
    const performanceTracer = PerformanceTracer.initial();
    await ServiceLoader.getInstance<ItemService>(
      ServiceConfig.ITEM_SERVICE,
    ).handleIncomingData(items, changeMap);
    performanceTracer.end({
      key: PERFORMANCE_KEYS.HANDLE_INCOMING_ITEM,
      count: items && items.length,
    });
  }

  private async _handleIncomingPresence(
    presences: RawPresence[],
    source: SYNC_SOURCE,
    changeMap?: Map<string, ChangeModel>,
  ) {
    mainLogger.info(
      LOG_INDEX_DATA,
      `_handleIncomingPresence() item.length: ${presences &&
        presences.length}, source: ${source}`,
    );
    const performanceTracer = PerformanceTracer.initial();
    await ServiceLoader.getInstance<PresenceService>(
      ServiceConfig.PRESENCE_SERVICE,
    ).presenceHandleData(presences, changeMap);
    performanceTracer.end({
      key: PERFORMANCE_KEYS.HANDLE_INCOMING_PRESENCE,
      count: presences && presences.length,
    });
  }

  private async _handleIncomingState(
    states: any[],
    source: SYNC_SOURCE,
    changeMap?: Map<string, ChangeModel>,
  ) {
    mainLogger.info(
      LOG_INDEX_DATA,
      `_handleIncomingState() states.length: ${states &&
        states.length}, source: ${source}`,
    );
    const performanceTracer = PerformanceTracer.initial();
    await ServiceLoader.getInstance<StateService>(
      ServiceConfig.STATE_SERVICE,
    ).handleState(states, source, changeMap);
    performanceTracer.end({
      key: PERFORMANCE_KEYS.HANDLE_INCOMING_STATE,
      count: states && states.length,
    });
  }

  private async _handleIncomingProfile(
    profile: Raw<Profile> | null,
    source: SYNC_SOURCE,
    changeMap?: Map<string, ChangeModel>,
  ) {
    mainLogger.info(
      LOG_INDEX_DATA,
      `_handleIncomingProfile(), source: ${source}`,
    );
    const performanceTracer = PerformanceTracer.initial();
    await ServiceLoader.getInstance<ProfileService>(
      ServiceConfig.PROFILE_SERVICE,
    ).handleIncomingData(profile, source, changeMap);
    performanceTracer.end({ key: PERFORMANCE_KEYS.HANDLE_INCOMING_PROFILE });
  }

  private async _handleIncomingPerson(
    persons: Raw<Person>[],
    source: SYNC_SOURCE,
    changeMap?: Map<string, ChangeModel>,
  ) {
    mainLogger.info(
      LOG_INDEX_DATA,
      `_handleIncomingPerson() persons.length: ${persons &&
        persons.length}, source: ${source}`,
    );
    const performanceTracer = PerformanceTracer.initial();
    await ServiceLoader.getInstance<PersonService>(
      ServiceConfig.PERSON_SERVICE,
    ).handleIncomingData(persons, source, changeMap);
    performanceTracer.end({
      key: PERFORMANCE_KEYS.HANDLE_INCOMING_PERSON,
      count: persons && persons.length,
    });
  }

  private async _handleIncomingGroup(
    groups: Raw<Group>[],
    source: SYNC_SOURCE,
    changeMap?: Map<string, ChangeModel>,
  ) {
    mainLogger.info(
      LOG_INDEX_DATA,
      `_handleIncomingGroup() groups.length: ${groups &&
        groups.length}, source: ${source}`,
    );
    const performanceTracer = PerformanceTracer.initial();
    await ServiceLoader.getInstance<GroupService>(
      ServiceConfig.GROUP_SERVICE,
    ).handleData(groups, source, changeMap);
    performanceTracer.end({
      key: PERFORMANCE_KEYS.HANDLE_INCOMING_GROUP,
      count: groups && groups.length,
    });
  }

  private async _handleIncomingPost(
    posts: Raw<Post>[],
    maxPostsExceeded: boolean,
    source: SYNC_SOURCE,
    changeMap?: Map<string, ChangeModel>,
  ) {
    mainLogger.info(
      LOG_INDEX_DATA,
      `_handleIncomingPost() posts.length: ${posts &&
        posts.length}, source: ${source}`,
    );
    const performanceTracer = PerformanceTracer.initial();
    await ServiceLoader.getInstance<PostService>(
      ServiceConfig.POST_SERVICE,
    ).handleIndexData(posts, maxPostsExceeded, changeMap);
    performanceTracer.end({
      key: PERFORMANCE_KEYS.HANDLE_INCOMING_POST,
      count: posts && posts.length,
    });
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
    const socketUserConfig = ServiceLoader.getInstance<SyncService>(
      ServiceConfig.SYNC_SERVICE,
    ).userConfig;
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
      const socketUserConfig = ServiceLoader.getInstance<SyncService>(
        ServiceConfig.SYNC_SERVICE,
      ).userConfig;
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
    const syncConfig = ServiceLoader.getInstance<SyncService>(
      ServiceConfig.SYNC_SERVICE,
    ).userConfig;
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
    const syncConfig = ServiceLoader.getInstance<SyncService>(
      ServiceConfig.SYNC_SERVICE,
    ).userConfig;
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
    const syncUserConfig = ServiceLoader.getInstance<SyncService>(
      ServiceConfig.SYNC_SERVICE,
    ).userConfig;
    syncUserConfig.setSocketConnectedLocalTime(time);
  }
}

export { SyncController };
