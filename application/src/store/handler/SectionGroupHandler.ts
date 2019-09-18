/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2018-10-24 13:25:32
 * Copyright © RingCentral. All rights reserved.
 */
/* eslint-disable */
import { defaultNotificationOptions } from '@/common/catchError';
import { Notification } from '@/containers/Notification';
import history from '@/history';
import { SECTION_TYPE } from '@/modules/message/container/LeftRail/Section/types';
import BaseNotificationSubscribable from '@/store/base/BaseNotificationSubscribable';
import {
  FetchSortableDataListHandler,
  IFetchSortableDataListHandlerOptions,
  IFetchSortableDataProvider,
  ISortableModel,
  ISortableModelWithData,
} from '@/store/base/fetch';
import storeManager from '@/store/base/StoreManager';
import { ENTITY_NAME, GLOBAL_KEYS } from '@/store/constants';
import GroupStateModel from '@/store/models/GroupState';
import ProfileModel from '@/store/models/Profile';
import { getEntity, getGlobalValue, getSingleEntity } from '@/store/utils';
import _ from 'lodash';
import { autorun, computed, reaction, action } from 'mobx';
import { mainLogger } from 'foundation/log';
import { PerformanceTracer } from 'foundation/performance';
import { MAINTAIN_DIRECTION, QUERY_DIRECTION } from 'sdk/dao';
import { AccountService } from 'sdk/module/account';
import { GroupService } from 'sdk/module/group';
import { Group } from 'sdk/module/group/entity';
import { ProfileService } from 'sdk/module/profile';
import { Profile } from 'sdk/module/profile/entity';
import { ServiceConfig, ServiceLoader } from 'sdk/module/serviceLoader';
import { StateService } from 'sdk/module/state';
import { GroupState } from 'sdk/module/state/entity';
import { ENTITY, EVENT_TYPES, GROUP_QUERY_TYPE } from 'sdk/service';
import {
  NotificationEntityPayload,
  NotificationEntityReplacePayload,
  NotificationEntityReplaceBody,
} from 'sdk/service/notificationCenter';
import { TDelta } from '../base/fetch/types';
import { STORE_PERFORMANCE_KEYS } from '../config/performanceKeys';
import { PreFetchConversationDataHandler } from './PreFetchConversationDataHandler';

function groupTransformFunc(data: Group): ISortableModel {
  const {
    most_recent_post_created_at = 0,
    created_at,
    __last_accessed_at = 0,
    id,
  } = data;
  return {
    id,
    sortValue: -Math.max(
      most_recent_post_created_at,
      created_at,
      __last_accessed_at,
    ),
  };
}

class GroupDataProvider implements IFetchSortableDataProvider<Group> {
  constructor(
    private _queryType: GROUP_QUERY_TYPE,
    private _limitCountFunc: () => Promise<number>,
  ) {}

  async fetchData(
    direction: QUERY_DIRECTION,
    pageSize: number,
    anchor: ISortableModel,
    offset?: number,
  ): Promise<{ data: Group[]; hasMore: boolean }> {
    const groupService = ServiceLoader.getInstance<GroupService>(
      ServiceConfig.GROUP_SERVICE,
    );
    let limitCount = 0;
    switch (this._queryType) {
      case GROUP_QUERY_TYPE.FAVORITE:
        limitCount = Infinity;
        break;
      case GROUP_QUERY_TYPE.GROUP:
        limitCount = await this._limitCountFunc();
        break;
      case GROUP_QUERY_TYPE.TEAM:
        limitCount = await this._limitCountFunc();
        pageSize = offset
          ? pageSize
          : limitCount < DEFAULT_LEFT_RAIL_GROUP
          ? DEFAULT_LEFT_RAIL_GROUP
          : limitCount;
        break;
    }
    const result = await groupService.getGroupsByType(
      this._queryType,
      offset,
      limitCount,
      pageSize,
    );
    mainLogger
      .tags(LOG_TAG)
      .info(
        `fetch left rail group: ${result && result.data.length} type: ${
          this._queryType
        }`,
      );
    return result || { data: [], hasMore: false };
  }
}

const LOG_TAG = '[SectionGroupHandler]';
const DEFAULT_LEFT_RAIL_GROUP: number = 20;

class SectionGroupHandler extends BaseNotificationSubscribable {
  private _handlersMap: {} = {};
  private _queryMap: {} = {};
  private _oldFavGroupIds: number[] = [];
  private static _instance: SectionGroupHandler | undefined = undefined;
  private _hiddenGroupIds: number[] = [];
  private _lastGroupId: number = 0;
  private _dataLoader: Promise<any>;
  private _initFavorites = false;
  private _maxLeftRailGroup = DEFAULT_LEFT_RAIL_GROUP;

  constructor() {
    super();
    this._dataLoader = this._init();
  }

  private async _init() {
    mainLogger.tags(LOG_TAG).info('start init SectionGroupHandler');
    await this._initHandlerMap();
    this._lastGroupId = storeManager
      .getGlobalStore()
      .get(GLOBAL_KEYS.CURRENT_CONVERSATION_ID);
    this._subscribeNotification();
    autorun(() => this._handleFavoriteIdsChange());
    reaction(
      () => {
        const hiddenGroupIds = getSingleEntity<Profile, ProfileModel>(
          ENTITY_NAME.PROFILE,
          'hiddenGroupIds',
        );
        return hiddenGroupIds || [];
      },
      (newIds: number[]) => this._handleHiddenIdsChange(newIds),
    );
    autorun(() => this.removeOverLimitGroupByChangingCurrentGroupId());
  }

  static getInstance() {
    if (!this._instance) {
      this._instance = new SectionGroupHandler();
    }
    return this._instance;
  }

  @action
  onReady(handler: (list: number[]) => any) {
    const ids = this.groupIds;
    this._dataLoader = this._dataLoader.then(() => handler(ids));
  }

  private _initHandlerMap() {
    return Promise.all([
      this._addFavoriteSection(),
      this._addDirectMessageSection(),
      this._addTeamSection(),
    ]);
  }

  private _subscribeNotification() {
    this.subscribeNotification(
      ENTITY.GROUP,
      (payload: NotificationEntityPayload<Group>) => {
        const keys = Object.keys(this._handlersMap);
        let ids: number[] = [];
        let removeFromCurrentTeam = false;
        let isCurrentTeamNotValid = false;
        if (payload.type === EVENT_TYPES.UPDATE) {
          ids = payload.body!.ids!;
          const currentUserId = getGlobalValue(GLOBAL_KEYS.CURRENT_USER_ID);
          ids.forEach((id: number) => {
            const group = payload.body.entities.get(id);
            const isCurrentGroup = this._isCurrentConversation(id);
            const includeCurrentUser =
              group && group.members.includes(currentUserId);
            removeFromCurrentTeam =
              isCurrentGroup && (!group || !includeCurrentUser);
            isCurrentTeamNotValid =
              isCurrentGroup &&
              (!group || group.deactivated || !!group.is_archived);
          });
        }
        if (removeFromCurrentTeam) {
          Notification.flashToast({
            ...defaultNotificationOptions,
            message: 'people.prompt.noLongerAMemberOfThisTeam',
          });
          mainLogger
            .tags(LOG_TAG)
            .info(
              'subscribe notification|user was removed from current conversation',
            );
        }
        // update url
        (removeFromCurrentTeam || isCurrentTeamNotValid) && this._updateUrl();
        keys.forEach((key: string) => {
          this._handlersMap[key].onDataChanged(payload);
        });
      },
    );

    this.subscribeNotification(
      ENTITY.GROUP_STATE,
      (payload: NotificationEntityPayload<GroupState>) => {
        this._handleGroupStateChange(payload);
      },
    );

    this.subscribeNotification(
      ENTITY.PROFILE,
      (payload: NotificationEntityPayload<Profile>) => {
        this._handleMaxLeftRailGroupChange(payload);
      },
    );
  }

  private _handleMaxLeftRailGroupChange(
    payload: NotificationEntityPayload<Profile>,
  ) {
    if (payload.type === EVENT_TYPES.UPDATE) {
      let maxCountChanged = false;
      payload.body.entities.forEach((profile: Profile) => {
        if (profile && profile.max_leftrail_group_tabs2) {
          const count = Number(profile.max_leftrail_group_tabs2);
          maxCountChanged = this._maxLeftRailGroup !== count;
          this._updateMaxLeftRail(count);
        }
      });
      maxCountChanged && this._refreshLeftRail();
    }
  }

  private _updateMaxLeftRail(count: number) {
    if (this._maxLeftRailGroup !== count) {
      mainLogger
        .tags(LOG_TAG)
        .info(
          '_updateMaxLeftRail() update from:',
          this._maxLeftRailGroup,
          'to:',
          count,
        );
      this._maxLeftRailGroup = count;
      const handler = this._handlersMap[SECTION_TYPE.TEAM];
      handler && handler.setPageSize(count);
    }
  }

  private async _handleFavoriteIdsChange() {
    const newFavIds =
      getSingleEntity<Profile, ProfileModel>(
        ENTITY_NAME.PROFILE,
        'favoriteGroupIds',
      ) || [];
    if (!this._initFavorites) {
      this._oldFavGroupIds = newFavIds;
      this._initFavorites = true;
      return;
    }

    if (this._oldFavGroupIds.toString() !== newFavIds.toString()) {
      mainLogger
        .tags(LOG_TAG)
        .info('_handleFavoriteIdsChange() favorite change, start handle');
      const removeFromFavIds = _.difference(this._oldFavGroupIds, newFavIds); // less fav more groups
      const addToFavIds = _.difference(newFavIds, this._oldFavGroupIds); // less group more fav
      this._oldFavGroupIds = newFavIds;
      const groupService = ServiceLoader.getInstance<GroupService>(
        ServiceConfig.GROUP_SERVICE,
      );
      const result = await groupService.getGroupsByType(
        GROUP_QUERY_TYPE.FAVORITE,
        0,
        Infinity,
      );
      this._handlersMap[SECTION_TYPE.FAVORITE].replaceAll(result.data);
      if (removeFromFavIds) {
        await this._addGroupsToSection(removeFromFavIds);
      }
      this._removeGroupsBySectionType(
        SECTION_TYPE.DIRECT_MESSAGE,
        addToFavIds,
        false,
      );
      this._removeGroupsBySectionType(SECTION_TYPE.TEAM, addToFavIds, false);
    }
  }

  private _handleHiddenIdsChange(newIds: number[]) {
    mainLogger
      .tags(LOG_TAG)
      .info('_handleHiddenIdsChange() hidden group ids change, start handle');
    this.checkIfGroupOpenedFromHidden(this._hiddenGroupIds, newIds);
    this._hiddenGroupIds = newIds;
    this._removeGroupsIfExistedInHiddenGroups();
  }

  // FIJI-1662
  async checkIfGroupOpenedFromHidden(oldIds: number[], newIds: number[]) {
    mainLogger.tags(LOG_TAG).info('checkIfGroupOpenedFromHidden()');
    const ids = _.difference(oldIds, newIds);
    if (ids.length) {
      await this._addGroupsToSection(ids);
    }
  }

  private _removeGroupsIfExistedInHiddenGroups() {
    const currentGroupId = storeManager
      .getGlobalStore()
      .get(GLOBAL_KEYS.CURRENT_CONVERSATION_ID);
    const removeIds: number[] = [];
    let removeFromCurrentTeam = false;
    const keys = Object.keys(this._handlersMap) as SECTION_TYPE[];
    for (const key of keys) {
      const inters = _.intersection(
        this._hiddenGroupIds,
        this.getGroupIdsByType(key),
      );
      if (inters.length) {
        inters.forEach((groupId: number) => {
          if (currentGroupId === groupId) {
            removeFromCurrentTeam = true;
          }
          const groupState: GroupStateModel = getEntity(
            ENTITY_NAME.GROUP_STATE,
            groupId,
          );
          if (!groupState.unreadCount || groupState.unreadCount <= 0) {
            removeIds.push(groupId);
          }
        });
        mainLogger
          .tags(LOG_TAG)
          .info(
            '_removeGroupsIfExistedInHiddenGroups() sectionType:',
            key,
            'removeIds:',
            inters,
          );
        this._removeByIds(key, inters);
      }
      if (inters.length === this._hiddenGroupIds.length) {
        break;
      }
    }
    removeFromCurrentTeam && this._updateUrl();
  }

  private async _refreshLeftRail() {
    mainLogger.tags(LOG_TAG).info('_refreshLeftRail()');
    const keys = Object.keys(this._handlersMap);

    const groupService = ServiceLoader.getInstance<GroupService>(
      ServiceConfig.GROUP_SERVICE,
    );
    keys.forEach(async (key: string) => {
      if (key === SECTION_TYPE.FAVORITE) {
        return;
      }

      const result = await groupService.getGroupsByType(
        this._queryMap[key],
        0,
        this._maxLeftRailGroup,
        this._maxLeftRailGroup,
      );
      const entityMap = new Map<number, Group>();
      if (result && result.data.length) {
        result.data.forEach((group: Group) => {
          entityMap.set(group.id, group);
        });
      }
      const ids = Array.from(entityMap.keys());

      const currentGroupId = getGlobalValue(
        GLOBAL_KEYS.CURRENT_CONVERSATION_ID,
      );
      if (!entityMap.has(currentGroupId)) {
        const currentGroup = groupService.getSynchronously(currentGroupId);
        if (currentGroup) {
          entityMap.set(currentGroupId, currentGroup);
          ids.push(currentGroupId);
        }
      }

      const notificationBody: NotificationEntityReplaceBody<Group> = {
        ids,
        entities: entityMap,
        isReplaceAll: true,
      };

      const notification: NotificationEntityReplacePayload<Group> = {
        type: EVENT_TYPES.REPLACE,
        body: notificationBody,
      };
      key === SECTION_TYPE.TEAM &&
        this._handlersMap[key].setHasMore(
          result.hasMore,
          QUERY_DIRECTION.NEWER,
        );
      this._handlersMap[key].onDataChanged(notification);
    });
  }

  private async _handleGroupStateChange(
    payload: NotificationEntityPayload<GroupState>,
  ) {
    if (payload.type !== EVENT_TYPES.UPDATE || !payload.body.entities) {
      return;
    }
    mainLogger.tags(LOG_TAG).info('_handleGroupStateChange()');
    const unreadIds: number[] = [];
    const withoutUnreadIds: number[] = [];
    const currentId = getGlobalValue(GLOBAL_KEYS.CURRENT_CONVERSATION_ID);

    payload.body.entities.forEach((state: GroupState) => {
      const hasUnread = state.unread_count;
      if (hasUnread) {
        unreadIds.push(state.id);
      } else if (currentId !== state.id) {
        withoutUnreadIds.push(state.id);
      }
    });
    unreadIds.length && (await this._addGroupsToSection(unreadIds));
    this._removeGroupsBySectionType(
      SECTION_TYPE.DIRECT_MESSAGE,
      withoutUnreadIds,
      true,
    );
    this._removeGroupsBySectionType(SECTION_TYPE.TEAM, withoutUnreadIds, true);
  }

  private _removeGroupsBySectionType(
    sectionType: SECTION_TYPE,
    handleIds: number[],
    checkLimit: boolean = true,
  ) {
    if (handleIds.length) {
      const ids = this.getGroupIdsByType(sectionType);
      const interIds = _.intersection(handleIds, ids);
      let removeIds: number[] = [];
      if (checkLimit) {
        removeIds = interIds.filter((id: number) => {
          return ids.indexOf(id) >= this._maxLeftRailGroup;
        });
      } else {
        removeIds = interIds;
      }
      if (removeIds) {
        mainLogger
          .tags(LOG_TAG)
          .info(
            '_removeGroupsBySectionType() sectionType:',
            sectionType,
            'removeIds:',
            removeIds,
            'checkLimit:',
            checkLimit,
          );
        this._handlersMap[sectionType].removeByIds(removeIds);
      }
    }
  }

  @action
  private async _addGroupsToSection(ids: number[]) {
    const diffIds = _.difference(ids, this.groupIdsExcludeFavorites);
    if (diffIds.length) {
      const groupService = ServiceLoader.getInstance<GroupService>(
        ServiceConfig.GROUP_SERVICE,
      );
      const addGroups: Group[] =
        (await groupService.getGroupsByIds(diffIds)) || [];
      const validGroups = addGroups.filter((group: Group) =>
        groupService.isValid(group),
      );
      mainLogger
        .tags(LOG_TAG)
        .info(
          '_addGroupsToSection() add ids:',
          diffIds,
          'valid size:',
          validGroups.length,
        );
      if (validGroups && validGroups.length) {
        this._handlersMap[SECTION_TYPE.DIRECT_MESSAGE].upsert(validGroups);
        this._handlersMap[SECTION_TYPE.TEAM].upsert(validGroups);
      }
    }
  }

  private _updateUrl() {
    history.replace('/messages');
  }

  private _handleGroupChanged = (delta: TDelta) => {
    const { deleted, updated, added } = delta;
    const addedIds = added.map((item: ISortableModelWithData<any>) => item.id);

    if (deleted.length) {
      const trulyDeleted = _.differenceBy(deleted, addedIds);
      trulyDeleted.forEach((groupId: number) => {
        PreFetchConversationDataHandler.getInstance().removeCache(groupId);
      });
    }

    if (updated.length) {
      updated.forEach((group: ISortableModel) => {
        if (!PreFetchConversationDataHandler.getInstance().isGroupCachedBefore(group.id)) {
          this._addToFetchProcessor(group.id);
        }
      });
      this._removeOverLimitGroups(updated.length);
    }

    if (added.length) {
      const trulyAdded = _.differenceBy(addedIds, deleted);
      trulyAdded.forEach((groupId: number) => {
        if (!PreFetchConversationDataHandler.getInstance().isGroupCachedBefore(groupId)) {
          this._addToFetchProcessor(groupId);
        }
      });
      const addCount = trulyAdded.length;
      addCount && this._removeOverLimitGroups(addCount);
    }
  };

  private async _addSection(
    sectionType: SECTION_TYPE,
    queryType: GROUP_QUERY_TYPE,
    config: IFetchSortableDataListHandlerOptions<Group>,
  ) {
    const dataProvider = new GroupDataProvider(
      queryType,
      this._getMaxLeftRailGroup,
    );
    this._handlersMap[sectionType] = new FetchSortableDataListHandler(
      dataProvider,
      config,
    );
    this._handlersMap[sectionType].addDataChangeCallback(
      this._handleGroupChanged,
    );

    this._queryMap[sectionType] = queryType;

    return this.fetchGroups(
      sectionType,
      QUERY_DIRECTION.NEWER,
      config.offset,
      config.pageSize,
    );
  }

  private async _addFavoriteSection() {
    const isMatchFun = (model: Group) => {
      const groupState: GroupStateModel = getEntity(
        ENTITY_NAME.GROUP_STATE,
        model.id,
      );
      const hasUnread =
        groupState && groupState.unreadCount
          ? groupState.unreadCount > 0
          : false;
      const currentUserId = getGlobalValue(GLOBAL_KEYS.CURRENT_USER_ID);
      const includesMe =
        currentUserId && _.includes(model.members, currentUserId);
      const groupService = ServiceLoader.getInstance<GroupService>(
        ServiceConfig.GROUP_SERVICE,
      );
      return (
        this._oldFavGroupIds.indexOf(model.id) !== -1 &&
        (this._hiddenGroupIds.indexOf(model.id) === -1 || hasUnread) &&
        includesMe &&
        groupService.isValid(model)
      );
    };
    const transformFun = (model: Group) => {
      return {
        id: model.id,
        sortValue: 0,
      } as ISortableModel;
    };

    return this._addSection(SECTION_TYPE.FAVORITE, GROUP_QUERY_TYPE.FAVORITE, {
      isMatchFunc: isMatchFun,
      transformFunc: transformFun,
      entityName: ENTITY_NAME.GROUP,
      eventName: undefined, // it should not subscribe notification by itself
    });
  }

  private async _addDirectMessageSection() {
    const isMatchFun = (model: Group, sortableModel: ISortableModel) => {
      const groupState: GroupStateModel = getEntity(
        ENTITY_NAME.GROUP_STATE,
        model.id,
      );
      const hasUnread =
        groupState && groupState.unreadCount
          ? groupState.unreadCount > 0
          : false;
      const currentUserId = getGlobalValue(GLOBAL_KEYS.CURRENT_USER_ID);
      const isCurrentConversation = this._isCurrentConversation(model.id);
      const createdByMeOrHasPostTime: boolean =
        model.most_recent_post_created_at !== undefined ||
        model.creator_id === currentUserId;

      const groupService = ServiceLoader.getInstance<GroupService>(
        ServiceConfig.GROUP_SERVICE,
      );
      return (
        this._oldFavGroupIds.indexOf(model.id) === -1 &&
        (this._hiddenGroupIds.indexOf(model.id) === -1 || hasUnread) &&
        !model.is_team &&
        createdByMeOrHasPostTime &&
        groupService.isValid(model) &&
        (hasUnread ||
          isCurrentConversation ||
          this._isInLimitation(SECTION_TYPE.DIRECT_MESSAGE, sortableModel))
      );
    };
    return this._addSection(
      SECTION_TYPE.DIRECT_MESSAGE,
      GROUP_QUERY_TYPE.GROUP,
      {
        isMatchFunc: isMatchFun,
        transformFunc: groupTransformFunc,
        entityName: ENTITY_NAME.GROUP,
        eventName: undefined, // it should not subscribe notification by itself
      },
    );
  }

  private async _addTeamSection() {
    const isMatchFun = (model: Group, sortableModel: ISortableModel) => {
      const groupState: GroupStateModel = getEntity(
        ENTITY_NAME.GROUP_STATE,
        model.id,
      );
      const hasUnread =
        groupState && groupState.unreadCount
          ? groupState.unreadCount > 0
          : false;
      const isTeam = !!model.is_team;
      const includesMe = () => {
        const userId = getGlobalValue(GLOBAL_KEYS.CURRENT_USER_ID);
        return userId && _.includes(model.members, userId);
      };
      const groupService = ServiceLoader.getInstance<GroupService>(
        ServiceConfig.GROUP_SERVICE,
      );
      return (
        isTeam &&
        groupService.isValid(model) &&
        this._oldFavGroupIds.indexOf(model.id) === -1 &&
        (this._hiddenGroupIds.indexOf(model.id) === -1 || hasUnread) &&
        includesMe() &&
        (hasUnread ||
          this._isCurrentConversation(model.id) ||
          this._isInLimitation(SECTION_TYPE.TEAM, sortableModel))
      );
    };
    return this._addSection(SECTION_TYPE.TEAM, GROUP_QUERY_TYPE.TEAM, {
      isMatchFunc: isMatchFun,
      transformFunc: groupTransformFunc,
      entityName: ENTITY_NAME.GROUP,
      eventName: undefined, // it should not subscribe notification by itself
      offset: 0,
      maintainDirection: MAINTAIN_DIRECTION.UP,
    });
  }

  private _isCurrentConversation(id: number) {
    const currentConversationId = getGlobalValue(
      GLOBAL_KEYS.CURRENT_CONVERSATION_ID,
    );
    return currentConversationId === id;
  }

  private _isInLimitation(
    sectionType: SECTION_TYPE,
    sortableModel: ISortableModel,
  ) {
    const sortableListStore = this._handlersMap[sectionType].sortableListStore;
    if (sortableListStore.size >= this._maxLeftRailGroup) {
      const limitSortableModel: ISortableModel = this._handlersMap[sectionType]
        .sortableListStore.items[this._maxLeftRailGroup - 1];
      return limitSortableModel
        ? sortableModel.sortValue <= limitSortableModel.sortValue
        : true;
    }
    return true;
  }

  setLeftRailVisible(isVisible: boolean) {
    const size = this._handlersMap[SECTION_TYPE.TEAM].size;
    !isVisible &&
      size > this._maxLeftRailGroup &&
      this._handlersMap[SECTION_TYPE.TEAM].setHasMore(
        true,
        QUERY_DIRECTION.NEWER,
      );
    this._handlersMap[SECTION_TYPE.TEAM].maintainMode = !isVisible;
  }

  async fetchPagination(sectionType: SECTION_TYPE) {
    const offset = this._handlersMap[SECTION_TYPE.TEAM].size - 1;
    mainLogger
      .tags(LOG_TAG)
      .info('fetchPagination() offset:', offset, sectionType);
    this._handlersMap[sectionType].fetchData(
      QUERY_DIRECTION.NEWER,
      DEFAULT_LEFT_RAIL_GROUP,
      offset > 0 ? offset : 0,
    );
  }

  hasMore(sectionType: SECTION_TYPE, direction: QUERY_DIRECTION) {
    return this._handlersMap[sectionType].hasMore(direction);
  }

  async fetchGroups(
    sectionType: SECTION_TYPE,
    direction: QUERY_DIRECTION,
    offset?: number,
    pageSize?: number,
  ) {
    if (this._handlersMap[sectionType]) {
      const performanceKey = this._getPerformanceKey(sectionType);
      const performanceTracer = PerformanceTracer.start();
      const groups =
        (await this._handlersMap[sectionType].fetchData(
          direction,
          pageSize,
          offset,
        )) || [];
      if (sectionType === SECTION_TYPE.FAVORITE) {
        groups.forEach((group: Group) => {
          this._addToFetchProcessor(group.id);
        });
      } else {
        const stateService = ServiceLoader.getInstance<StateService>(
          ServiceConfig.STATE_SERVICE,
        );
        if (stateService.isCacheInitialized()) {
          groups.forEach((group: Group) => {
            const state = stateService.getSynchronously(group.id);
            this._addToFetchDependUnread(group.id, state, sectionType);
          });
        } else {
          const groupIds = groups.map((group: Group) => group.id);
          const groupStates = await stateService.batchGet(groupIds);
          groupStates.forEach((groupState: GroupState) => {
            this._addToFetchDependUnread(groupState.id, groupState, sectionType);
          });
        }
      }
      performanceTracer.end({ key: performanceKey, count: groups.length });
    }
  }

  private _addToFetchDependUnread(
    groupId: number,
    state: GroupState | null,
    sectionType: SECTION_TYPE,
  ) {
    const hasUnread =
      state &&
      (sectionType === SECTION_TYPE.DIRECT_MESSAGE
        ? state.unread_count
        : state.unread_mentions_count);
    hasUnread && this._addToFetchProcessor(groupId);
  }

  private _addToFetchProcessor(groupId: number) {
    PreFetchConversationDataHandler.getInstance().addProcessor(groupId);
  }

  private _getPerformanceKey(sectionType: SECTION_TYPE): string {
    switch (sectionType) {
      case SECTION_TYPE.FAVORITE:
        return STORE_PERFORMANCE_KEYS.GROUP_SECTION_FETCH_FAVORITES;

      case SECTION_TYPE.DIRECT_MESSAGE:
        return STORE_PERFORMANCE_KEYS.GROUP_SECTION_FETCH_DIRECT_MESSAGES;

      case SECTION_TYPE.TEAM:
        return STORE_PERFORMANCE_KEYS.GROUP_SECTION_FETCH_TEAMS;
    }
  }

  private async _removeOverLimitGroupByChangingCurrentGroupId(
    type: SECTION_TYPE,
    limit: number,
    lastGroupId: number,
  ) {
    const lastGroupIndex = this.getGroupIdsByType(type).indexOf(lastGroupId);
    if (lastGroupIndex >= limit) {
      const result = this._isGroupWithoutUnread(lastGroupId);
      if (result) {
        this._removeByIds(type, [lastGroupId]);
      }
    }
  }

  private _isGroupWithoutUnread(id: number) {
    const groupState: GroupStateModel = getEntity(ENTITY_NAME.GROUP_STATE, id);
    return !groupState.unreadCount || groupState.unreadCount <= 0;
  }

  private _removeByIds(type: SECTION_TYPE, ids: number[]) {
    if (ids.length === 0) return;
    const handler = this._handlersMap[type];
    handler.removeByIds(ids);
  }

  async removeOverLimitGroupByChangingCurrentGroupId() {
    const currentId = getGlobalValue(GLOBAL_KEYS.CURRENT_CONVERSATION_ID);
    const lastGroupId = this._lastGroupId;
    mainLogger
      .tags(LOG_TAG)
      .info(
        `removeOverLimitGroupByChangingCurrentGroupId limit: ${
          this._maxLeftRailGroup
        }`,
      );
    if (currentId !== lastGroupId) {
      await this._removeOverLimitGroupByChangingCurrentGroupId(
        SECTION_TYPE.DIRECT_MESSAGE,
        this._maxLeftRailGroup,
        lastGroupId,
      );
      await this._removeOverLimitGroupByChangingCurrentGroupId(
        SECTION_TYPE.TEAM,
        this._maxLeftRailGroup,
        lastGroupId,
      );
      this._lastGroupId = currentId;
    }
  }

  private _removeOverLimitGroups(changeCount: number) {
    this._removeOverLimitGroupsByType(SECTION_TYPE.DIRECT_MESSAGE, changeCount);
    this._removeOverLimitGroupsByType(SECTION_TYPE.TEAM, changeCount);
  }

  private _removeOverLimitGroupsByType(
    sectionType: SECTION_TYPE,
    changeCount: number,
  ) {
    const ids = this.getGroupIdsByType(sectionType);
    const overLimitIds = ids.slice(
      this._maxLeftRailGroup,
      this._maxLeftRailGroup + changeCount,
    );
    if (overLimitIds.length) {
      let removeIds: number[] = [];
      overLimitIds.forEach((id: number) => {
        id !== this._lastGroupId &&
          this._isGroupWithoutUnread(id) &&
          removeIds.push(id);
      });
      mainLogger
        .tags(LOG_TAG)
        .info(
          '_removeOverLimitGroupsByType() type:',
          sectionType,
          'changeCount:',
          changeCount,
          'removeIds:',
          removeIds,
        );
      this._removeByIds(sectionType, removeIds);
    }
  }

  getRemovedIds(
    states: GroupState[],
    groupIds: number[],
    limit: number,
    currentGroupId: number,
  ) {
    const removedIds = [];
    const stateIdsSet = new Set<number>();
    states.forEach((state: GroupState) => {
      stateIdsSet.add(state.id);
    });

    for (let i = limit; i < groupIds.length; i++) {
      if (currentGroupId !== groupIds[i] && !stateIdsSet.has(groupIds[i])) {
        removedIds.push(groupIds[i]);
      }
    }
    return removedIds;
  }

  @computed
  get groupIds() {
    let ids: number[] = [];
    Object.keys(this._handlersMap).forEach((key: SECTION_TYPE) => {
      ids = ids.concat(this._handlersMap[key].sortableListStore.getIds);
    });
    return ids;
  }

  @computed
  get groupIdsExcludeFavorites() {
    let ids: number[] = [];
    Object.keys(this._handlersMap).forEach((key: SECTION_TYPE) => {
      if (key !== SECTION_TYPE.FAVORITE) {
        ids = ids.concat(this._handlersMap[key].sortableListStore.getIds);
      }
    });
    return ids;
  }

  getGroupIdsByType(type: SECTION_TYPE) {
    const ids =
      this._handlersMap[type] && this._handlersMap[type].sortableListStore
        ? this._handlersMap[type].sortableListStore.getIds
        : [];
    return ids;
  }

  private _getMaxLeftRailGroup = async (): Promise<number> => {
    const profileService = ServiceLoader.getInstance<ProfileService>(
      ServiceConfig.PROFILE_SERVICE,
    );

    const userConfig = ServiceLoader.getInstance<AccountService>(
      ServiceConfig.ACCOUNT_SERVICE,
    ).userConfig;
    const currentProfileId = userConfig.getCurrentUserProfileId();

    let count = DEFAULT_LEFT_RAIL_GROUP;
    let profile = profileService.getSynchronously(currentProfileId);
    if (!profile) {
      profile = await profileService.getProfile();
    }
    if (profile && profile.max_leftrail_group_tabs2) {
      count = Number(profile.max_leftrail_group_tabs2);
    }
    this._updateMaxLeftRail(count);
    return count;
  };
}

export default SectionGroupHandler;
