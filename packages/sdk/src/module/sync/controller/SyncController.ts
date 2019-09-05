/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2019-02-25 13:22:12
 * Copyright © RingCentral. All rights reserved.
 */

import { ERROR_CODES_NETWORK } from 'foundation/error';
import { mainLogger } from 'foundation/log';
import { PerformanceTracer } from 'foundation/performance';
import { indexData, initialData, remainingData } from '../../../api';
import { IndexDataModel } from '../../../api/glip/user';
import { ErrorParserHolder } from '../../../error/ErrorParserHolder';
import { ERROR_TYPES } from '../../../error/types';
import { Raw } from '../../../framework/model';
import { AccountService } from '../../account';
import { AccountGlobalConfig } from '../../account/config';
import { accountHandleData } from '../../account/service';
import { Company } from '../../company/entity';
import { Item } from '../../item/entity';
import { Person } from '../../person/entity';
import { Post } from '../../post/entity';
import { RawPresence } from '../../presence/entity';
import { ServiceConfig, ServiceLoader } from '../../serviceLoader';
import { CONFIG, SERVICE } from '../../../service/eventKey';
import notificationCenter from '../../../service/notificationCenter';
import { progressManager } from 'sdk/utils/progress';
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

import { ChangeModel, SYNC_SOURCE } from '../types';
import { DaoGlobalConfig } from 'sdk/dao/config';
import { SYNC_PERFORMANCE_KEYS } from '../config/performanceKeys';

import { IndexTaskController } from './IndexTaskController';
import { ACCOUNT_TYPE_ENUM } from 'sdk/authenticator/constants';
import { dataCollectionHelper } from 'sdk/framework';
import { transform } from 'sdk/service/utils';
import { LoginInfo } from 'sdk/types';

const LOG_TAG = 'SyncController';
class SyncController {
  private _isFetchingRemaining: boolean;
  private _isDataSyncing: boolean = false;
  private _syncListener: SyncListener;
  private _progressBar: {
    start: () => void;
    stop: () => void;
  };
  private _indexDataTaskController: IndexTaskController;

  constructor() {
    const progressBar = progressManager.newProgressBar();
    this._progressBar = {
      start: () => navigator.onLine && progressBar.start(),
      stop: () => progressBar.stop(),
    };
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

  isDataSyncing() {
    return this._isDataSyncing;
  }

  async syncData(syncListener?: SyncListener) {
    this._isDataSyncing = true;
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
    this._isDataSyncing = false;
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
    const performanceTracer = PerformanceTracer.start();
    const currentTime = Date.now();
    try {
      await this._fetchInitial(currentTime);
      mainLogger.info(LOG_TAG, 'fetch initial data success');
      this._traceLoginData(true);
      const glipLoginInfo: LoginInfo = { success: true, isFirstLogin: true };
      notificationCenter.emitKVChange(SERVICE.GLIP_LOGIN, glipLoginInfo);
    } catch (e) {
      mainLogger.error(LOG_TAG, 'fetch initial data error');
      this._traceLoginData(false);
      const accountType = ServiceLoader.getInstance<AccountService>(
        ServiceConfig.ACCOUNT_SERVICE,
      ).userConfig.getAccountType();
      if (accountType === ACCOUNT_TYPE_ENUM.RC) {
        const glipLoginInfo: LoginInfo = { success: false, isFirstLogin: true };
        notificationCenter.emitKVChange(SERVICE.GLIP_LOGIN, glipLoginInfo);
      } else {
        notificationCenter.emitKVChange(SERVICE.DO_SIGN_OUT);
      }
    }
    this._checkFetchedRemaining(currentTime);
    performanceTracer.end({ key: SYNC_PERFORMANCE_KEYS.FIRST_LOGIN });
    this._progressBar.stop();
  }

  private async _fetchInitial(time: number) {
    const { onInitialLoaded, onInitialHandled } = this._syncListener;
    const initialResult = await this.fetchInitialData(time);
    onInitialLoaded && (await onInitialLoaded(initialResult));

    const performanceTracer = PerformanceTracer.start();
    await this._handleIncomingData(initialResult, SYNC_SOURCE.INITIAL);
    performanceTracer.end({
      key: SYNC_PERFORMANCE_KEYS.HANDLE_INITIAL_DATA,
    });

    onInitialHandled && (await onInitialHandled());
    mainLogger.log(LOG_TAG, 'fetch initial data and handle success');
  }

  private async _checkFetchedRemaining(time: number) {
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
        notificationCenter.emitKVChange(SERVICE.FETCH_REMAINING_DONE);
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

    const performanceTracer = PerformanceTracer.start();
    await this._handleIncomingData(remainingResult, SYNC_SOURCE.REMAINING);
    performanceTracer.end({
      key: SYNC_PERFORMANCE_KEYS.HANDLE_REMAINING_DATA,
    });

    onRemainingHandled && (await onRemainingHandled());
    mainLogger.log('fetch remaining data and handle success');
    const syncConfig = ServiceLoader.getInstance<SyncService>(
      ServiceConfig.SYNC_SERVICE,
    ).userConfig;
    syncConfig.setFetchedRemaining(true);
  }

  private async _syncIndexData() {
    const executeFunc = async () => {
      const timeStamp = this.getIndexTimestamp();
      mainLogger.log(LOG_TAG, `start fetching index:${timeStamp}`);
      this._progressBar.start();
      const { onIndexLoaded, onIndexHandled } = this._syncListener;
      const syncConfig = ServiceLoader.getInstance<SyncService>(
        ServiceConfig.SYNC_SERVICE,
      ).userConfig;
      // 5 minutes ago to ensure data is correct
      try {
        const result = await this.fetchIndexData(String(timeStamp - 300000));
        mainLogger.log(LOG_INDEX_DATA, 'fetch index done');
        onIndexLoaded && (await onIndexLoaded(result));

        const performanceTracer = PerformanceTracer.start();
        await this._handleIncomingData(result, SYNC_SOURCE.INDEX);
        performanceTracer.end({
          key: SYNC_PERFORMANCE_KEYS.HANDLE_INDEX_DATA,
        });

        onIndexHandled && (await onIndexHandled());
        syncConfig.updateIndexSucceed(true);
        mainLogger.log(LOG_INDEX_DATA, 'handle index done');
      } catch (error) {
        mainLogger.log(LOG_INDEX_DATA, 'fetch index failed');
        syncConfig.updateIndexSucceed(false);
        await this._handleSyncIndexError(error);

        this._progressBar.stop();
        throw new Error(error);
      }
      mainLogger.log(LOG_INDEX_DATA, 'executeFunc done. stop progress');

      this._progressBar.stop();
    };
    const taskController = this._getIndexDataTaskController(executeFunc);
    taskController.start();
  }

  private _getIndexDataTaskController(executeFunc: () => any) {
    if (!this._indexDataTaskController) {
      this._indexDataTaskController = new IndexTaskController(executeFunc);
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
  ) => async (params: object) => await getDataFunction(params);

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

    const groupService = ServiceLoader.getInstance<GroupService>(
      ServiceConfig.GROUP_SERVICE,
    );
    const pureGroups = mergedGroups.map((group: Raw<Group>) => {
      return groupService.removeCursorsFromGroup(group);
    });

    const arrState: any[] = [];
    if (state && Object.keys(state).length > 0) {
      arrState.push(state);
    }

    let transProfile: Raw<Profile> | null = null;
    if (profile && Object.keys(profile).length > 0) {
      transProfile = profile;
    }
    const changeMap = new Map<string, ChangeModel>();
    const start = Date.now();

    // should handle account data first anyway
    const performanceTracer = PerformanceTracer.start();
    await accountHandleData({
      userId,
      companyId,
      clientConfig,
      profileId: profile ? profile._id : undefined,
    });
    performanceTracer.end({ key: this._getPerformanceKey(source, 'account') });

    await this._handleIncomingProfile(transProfile, source, changeMap)
      .then(() =>
        Promise.all([
          this._handleIncomingCompany(companies, source, changeMap),
          this._handleIncomingItem(items, source, changeMap),
          this._handleIncomingPresence(presences, source, changeMap),
          this._handleIncomingState(arrState, mergedGroups, source, changeMap),
        ]),
      )
      .then(() => this._handleIncomingPerson(people, source, changeMap))
      .then(() => this._handleIncomingGroup(pureGroups, source, changeMap))
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
    const performanceTracer = PerformanceTracer.start();
    await ServiceLoader.getInstance<CompanyService>(
      ServiceConfig.COMPANY_SERVICE,
    ).handleIncomingData(companies, source, changeMap);
    performanceTracer.end({
      key: this._getPerformanceKey(source, 'company'),
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
    const performanceTracer = PerformanceTracer.start();
    await ServiceLoader.getInstance<ItemService>(
      ServiceConfig.ITEM_SERVICE,
    ).handleIncomingData(items, changeMap);
    performanceTracer.end({
      key: this._getPerformanceKey(source, 'item'),
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
    const performanceTracer = PerformanceTracer.start();
    await ServiceLoader.getInstance<PresenceService>(
      ServiceConfig.PRESENCE_SERVICE,
    ).presenceHandleData(presences, changeMap);
    performanceTracer.end({
      key: this._getPerformanceKey(source, 'presence'),
      count: presences && presences.length,
    });
  }

  private async _handleIncomingState(
    states: any[],
    groups: Raw<Group>[],
    source: SYNC_SOURCE,
    changeMap?: Map<string, ChangeModel>,
  ) {
    mainLogger.info(
      LOG_INDEX_DATA,
      `_handleIncomingState() states.length: ${states &&
        states.length}, source: ${source}`,
    );
    const performanceTracer = PerformanceTracer.start();

    await ServiceLoader.getInstance<StateService>(
      ServiceConfig.STATE_SERVICE,
    ).handleStateAndGroupCursor(
      states,
      groups.map(group => transform<Group>(group)),
      source,
      changeMap,
    );

    performanceTracer.end({
      key: this._getPerformanceKey(source, 'state'),
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
    const performanceTracer = PerformanceTracer.start();
    await ServiceLoader.getInstance<ProfileService>(
      ServiceConfig.PROFILE_SERVICE,
    ).handleIncomingData(profile, source, changeMap);
    performanceTracer.end({
      key: this._getPerformanceKey(source, 'profile'),
    });
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
    const performanceTracer = PerformanceTracer.start();
    await ServiceLoader.getInstance<PersonService>(
      ServiceConfig.PERSON_SERVICE,
    ).handleIncomingData(persons, source, changeMap);
    performanceTracer.end({
      key: this._getPerformanceKey(source, 'person'),
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
    const performanceTracer = PerformanceTracer.start();
    await ServiceLoader.getInstance<GroupService>(
      ServiceConfig.GROUP_SERVICE,
    ).handleData(groups, source, changeMap);
    performanceTracer.end({
      key: this._getPerformanceKey(source, 'group'),
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
        posts.map(post => post._id)}, source: ${source}`,
    );
    const performanceTracer = PerformanceTracer.start();
    await ServiceLoader.getInstance<PostService>(
      ServiceConfig.POST_SERVICE,
    ).handleIndexData(posts, maxPostsExceeded, changeMap);
    performanceTracer.end({
      key: this._getPerformanceKey(source, 'post'),
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
      mainLogger.warn(`sync/handleData: ${error}`);
      notificationCenter.emitKVChange(SERVICE.FETCH_INDEX_DATA_ERROR, {
        error: ErrorParserHolder.getErrorParser().parse(error),
      });
    }
  }

  private _getPerformanceKey(source: SYNC_SOURCE, type: string) {
    switch (source) {
      case SYNC_SOURCE.INDEX:
        return `${SYNC_PERFORMANCE_KEYS.HANDLE_INDEX_INCOMING}${type}`;

      case SYNC_SOURCE.INITIAL:
        return `${SYNC_PERFORMANCE_KEYS.HANDLE_INITIAL_INCOMING}${type}`;

      case SYNC_SOURCE.REMAINING:
        return `${SYNC_PERFORMANCE_KEYS.HANDLE_REMAINING_INCOMING}${type}`;

      case SYNC_SOURCE.SOCKET:
        return `${SYNC_PERFORMANCE_KEYS.HANDLE_SOCKET_INCOMING}${type}`;
      default:
        return `${SYNC_PERFORMANCE_KEYS.HANDLE_INDEX_INCOMING}${type}`;
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

  private async _traceLoginData(isSuccess: boolean) {
    if (isSuccess) {
      const userConfig = ServiceLoader.getInstance<AccountService>(
        ServiceConfig.ACCOUNT_SERVICE,
      ).userConfig;

      dataCollectionHelper.traceLoginSuccess({
        accountType: 'glip',
        userId: userConfig.getGlipUserId(),
        companyId: userConfig.getCurrentCompanyId(),
      });
    } else {
      dataCollectionHelper.traceLoginFailed('glip', 'initial failed');
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
