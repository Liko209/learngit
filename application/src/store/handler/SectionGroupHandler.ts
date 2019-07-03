/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2018-10-24 13:25:32
 * Copyright © RingCentral. All rights reserved.
 */

import history from '@/history';
import storeManager from '@/store';
import {
  FetchSortableDataListHandler,
  IFetchSortableDataProvider,
  ISortableModel,
  ISortableModelWithData,
  IFetchSortableDataListHandlerOptions,
} from '@/store/base/fetch';
import BaseNotificationSubscribable from '@/store/base/BaseNotificationSubscribable';
import { GROUP_QUERY_TYPE, ENTITY, EVENT_TYPES } from 'sdk/service';
import { GroupService } from 'sdk/module/group';
import { Group } from 'sdk/module/group/entity';
import { Profile } from 'sdk/module/profile/entity';
import { GroupState } from 'sdk/module/state/entity';
import { SECTION_TYPE } from '@/modules/message/container/LeftRail/Section/types';
import { ENTITY_NAME, GLOBAL_KEYS } from '@/store/constants';
import GroupStateModel from '@/store/models/GroupState';
import ProfileModel from '@/store/models/Profile';
import { getEntity, getGlobalValue, getSingleEntity } from '@/store/utils';
import _ from 'lodash';
import { autorun, computed, observable, reaction } from 'mobx';
import { mainLogger, PerformanceTracer } from 'sdk';
import { QUERY_DIRECTION } from 'sdk/dao';
import { AccountService } from 'sdk/module/account';
import { ProfileService } from 'sdk/module/profile';
import { ServiceConfig, ServiceLoader } from 'sdk/module/serviceLoader';
import { StateService } from 'sdk/module/state';
import {
  NotificationEntityPayload,
  NotificationEntityReplaceBody,
  NotificationEntityReplacePayload,
} from 'sdk/service/notificationCenter';
import { TDelta } from '../base/fetch/types';
import preFetchConversationDataHandler from './PreFetchConversationDataHandler';
import { Notification } from '@/containers/Notification';
import { defaultNotificationOptions } from '@/common/catchError';
import { STORE_PERFORMANCE_KEYS } from '../config/performanceKeys';

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
        break;
    }

    const result = await groupService.getGroupsByType(
      this._queryType,
      0,
      limitCount,
    );
    mainLogger.info(
      `fetch left rail group: ${result && result.length} type: ${
        this._queryType
      }`,
    );
    return { data: result, hasMore: false };
  }
}

const LOG_TAG = 'SectionGroupHandler';
const DEFAULT_LEFT_RAIL_GROUP: number = 20;
const MAX_LEFT_RAIL_GROUP: number = 100;
const MAX_LEFT_RAIL_WITH_OPEN_GROUP: number = 101;

class SectionGroupHandler extends BaseNotificationSubscribable {
  private _handlersMap: {} = {};
  private _queryMap: {} = {};
  private _oldFavGroupIds: number[] = [];
  private static _instance: SectionGroupHandler | undefined = undefined;
  private _hiddenGroupIds: number[] = [];
  @observable
  private _lastGroupId: number = 0;
  private _dataLoader: Promise<any>;
  private _initFavorites = false;

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
    autorun(() => this._profileUpdateGroupSections());
    reaction(
      () => {
        const hiddenGroupIds = getSingleEntity<Profile, ProfileModel>(
          ENTITY_NAME.PROFILE,
          'hiddenGroupIds',
        );
        return hiddenGroupIds || [];
      },
      (newIds: number[]) => this._updateHiddenGroupIds(newIds),
    );
    autorun(() => this.removeOverLimitGroupByChangingIds());
    autorun(() => this.removeOverLimitGroupByChangingCurrentGroupId());
  }

  static getInstance() {
    if (!this._instance) {
      this._instance = new SectionGroupHandler();
    }
    return this._instance;
  }

  onReady(handler: (list: number[]) => any) {
    this._dataLoader = this._dataLoader.then(() => handler(this.groupIds));
  }

  private _updateHiddenGroupIds(newIds: number[]) {
    this.checkIfGroupOpenedFromHidden(this._hiddenGroupIds, newIds);
    this._hiddenGroupIds = newIds;
    this._removeGroupsIfExistedInHiddenGroups();
  }

  // FIJI-1662
  async checkIfGroupOpenedFromHidden(oldIds: number[], newIds: number[]) {
    const ids = _.difference(oldIds, newIds);
    if (ids.length) {
      await this._changeGroupsInGroupSections(ids, true);
    }
  }

  private _removeGroupsIfExistedInHiddenGroups() {
    const removeIds: number[] = [];
    this._hiddenGroupIds.forEach((groupId: number) => {
      const groupState: GroupStateModel = getEntity(
        ENTITY_NAME.GROUP_STATE,
        groupId,
      );
      if (!groupState.unreadCount || groupState.unreadCount <= 0) {
        removeIds.push(groupId);
      }
    });
    Object.keys(this._handlersMap).forEach((key: SECTION_TYPE) => {
      const inters = _.intersection(removeIds, this.getGroupIdsByType(key));
      if (inters.length) {
        this._removeByIds(key, inters);
      }
    });
    this._updateUrl(EVENT_TYPES.DELETE, this._hiddenGroupIds);
  }

  private async _changeGroupsInGroupSections(
    groupIds: number[],
    shouldAdd: boolean,
  ) {
    let ids = groupIds;
    if (!shouldAdd) {
      ids = _.intersection(groupIds, this.groupIdsExcludeFavorites);
      if (!ids.length) {
        return;
      }
    }
    if (shouldAdd) {
      const groupService = ServiceLoader.getInstance<GroupService>(
        ServiceConfig.GROUP_SERVICE,
      );
      const groups: Group[] = (await groupService.getGroupsByIds(ids)) || [];
      const validGroups = groups.filter((group: Group) =>
        groupService.isValid(group),
      );
      this._handlersMap[SECTION_TYPE.DIRECT_MESSAGE].upsert(validGroups);
      this._handlersMap[SECTION_TYPE.TEAM].upsert(validGroups);
    } else {
      this._remove(ids);
    }
  }

  private async _profileUpdateGroupSections() {
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
    if (this._oldFavGroupIds.toString() === newFavIds.toString()) {
      return;
    }

    if (this._oldFavGroupIds.toString() !== newFavIds.toString()) {
      const more = _.difference(this._oldFavGroupIds, newFavIds); // less fav more groups
      const less = _.difference(newFavIds, this._oldFavGroupIds); // less group more fav
      this._oldFavGroupIds = newFavIds;
      // handle favorite section change
      const groupService = ServiceLoader.getInstance<GroupService>(
        ServiceConfig.GROUP_SERVICE,
      );
      const groups = await groupService.getGroupsByType(
        GROUP_QUERY_TYPE.FAVORITE,
        0,
        Infinity,
      );
      this._handlersMap[SECTION_TYPE.FAVORITE].replaceAll(groups);

      if (more.length) {
        await this._changeGroupsInGroupSections(more, true);
      }
      if (less.length) {
        await this._changeGroupsInGroupSections(less, false);
      }
    }
  }

  private _subscribeNotification() {
    this.subscribeNotification(
      ENTITY.GROUP,
      (payload: NotificationEntityPayload<Group>) => {
        let ids: number[] = [];
        if (payload.type === EVENT_TYPES.UPDATE) {
          ids = payload.body!.ids!;
          const currentUserId = getGlobalValue(GLOBAL_KEYS.CURRENT_USER_ID);
          ids = ids.filter((id: number) => {
            const group = payload.body.entities.get(id);
            return (
              !group ||
              group.deactivated ||
              !_.includes(group.members, currentUserId) ||
              group.is_archived
            );
          });
        }
        if (payload.type === EVENT_TYPES.DELETE) {
          const currentGroupId = getGlobalValue(
            GLOBAL_KEYS.CURRENT_CONVERSATION_ID,
          );
          if (payload.body.ids && payload.body.ids.includes(currentGroupId)) {
            ids = [currentGroupId];
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
        }
        // update url
        this._updateUrl(EVENT_TYPES.DELETE, ids);
        this._handleGroupsChanges(true);
      },
    );

    this.subscribeNotification(ENTITY.GROUP_STATE, () => {
      this._handleGroupsChanges(false);
    });
  }

  private async _handleGroupsChanges(isIncludeFavorite: boolean = true) {
    const keys = Object.keys(this._handlersMap);

    const groupService = ServiceLoader.getInstance<GroupService>(
      ServiceConfig.GROUP_SERVICE,
    );
    keys.forEach(async (key: string) => {
      if (key === SECTION_TYPE.FAVORITE && !isIncludeFavorite) {
        return;
      }
      let limitCount = 0;
      switch (key) {
        case SECTION_TYPE.FAVORITE:
          limitCount = Infinity;
          break;
        case SECTION_TYPE.DIRECT_MESSAGE:
          limitCount = await this._getMaxLeftRailGroup();
          break;
        case SECTION_TYPE.TEAM:
          limitCount = await this._getMaxLeftRailGroup();
          break;
      }

      const result = await groupService.getGroupsByType(
        this._queryMap[key],
        0,
        limitCount,
      );
      const entityMap = new Map<number, Group>();
      if (result && result.length) {
        result.forEach((group: Group) => {
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

      this._handlersMap[key].onDataChanged(notification);
    });
  }

  private async _remove(ids: number[], checkLimit: boolean = false) {
    let limit = 0;
    if (checkLimit) {
      limit = await this._getMaxLeftRailGroup();
    }
    mainLogger.tags(LOG_TAG).info(`_remove limit: ${limit}`);
    const directIdsShouldBeRemoved: number[] = [];
    const teamIdsShouldBeRemoved: number[] = [];
    const directIds = this.getGroupIdsByType(SECTION_TYPE.DIRECT_MESSAGE);
    const teamIds = this.getGroupIdsByType(SECTION_TYPE.TEAM);
    ids.forEach((id: number) => {
      if (directIds.indexOf(id) >= limit) {
        directIdsShouldBeRemoved.push(id);
      }
      if (teamIds.indexOf(id) >= limit) {
        teamIdsShouldBeRemoved.push(id);
      }
    });
    directIdsShouldBeRemoved.length &&
      this._removeByIds(SECTION_TYPE.DIRECT_MESSAGE, directIdsShouldBeRemoved);
    teamIdsShouldBeRemoved.length &&
      this._removeByIds(SECTION_TYPE.TEAM, teamIdsShouldBeRemoved);
  }

  private _updateUrl(type: EVENT_TYPES, ids: number[]) {
    const currentGroupId = storeManager
      .getGlobalStore()
      .get(GLOBAL_KEYS.CURRENT_CONVERSATION_ID);
    if (type === EVENT_TYPES.DELETE) {
      if (ids.includes(currentGroupId)) {
        history.replace('/messages');
      }
    }
  }

  private _initHandlerMap() {
    return Promise.all([
      this._addFavoriteSection(),
      this._addDirectMessageSection(),
      this._addTeamSection(),
    ]);
  }

  private _handleGroupChanged = (delta: TDelta) => {
    const { deleted, updated, added } = delta;
    const addedIds = added.map((item: ISortableModelWithData<any>) => item.id);

    if (deleted.length) {
      const trulyDeleted = _.differenceBy(deleted, addedIds);
      trulyDeleted.forEach((groupId: number) => {
        preFetchConversationDataHandler.removeCache(groupId);
      });
    }

    if (updated.length) {
      updated.forEach((group: ISortableModel) => {
        if (!preFetchConversationDataHandler.isGroupCachedBefore(group.id)) {
          this._addToFetchProcessor(group.id);
        }
      });
    }

    if (added.length) {
      const trulyAdded = _.differenceBy(addedIds, deleted);
      trulyAdded.forEach((groupId: number) => {
        if (!preFetchConversationDataHandler.isGroupCachedBefore(groupId)) {
          this._addToFetchProcessor(groupId);
        }
      });
    }
  }

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

    return this.fetchGroups(sectionType, QUERY_DIRECTION.NEWER);
  }

  private async _addFavoriteSection() {
    const currentUserId = getGlobalValue(GLOBAL_KEYS.CURRENT_USER_ID);
    const isMatchFun = (model: Group) => {
      const groupState: GroupStateModel = getEntity(
        ENTITY_NAME.GROUP_STATE,
        model.id,
      );
      const hasUnread =
        groupState && groupState.unreadCount
          ? groupState.unreadCount > 0
          : false;
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
    const currentUserId = getGlobalValue(GLOBAL_KEYS.CURRENT_USER_ID);
    const isMatchFun = (model: Group) => {
      const groupState: GroupStateModel = getEntity(
        ENTITY_NAME.GROUP_STATE,
        model.id,
      );
      const hasUnread =
        groupState && groupState.unreadCount
          ? groupState.unreadCount > 0
          : false;
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
        groupService.isValid(model)
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
        limit: MAX_LEFT_RAIL_WITH_OPEN_GROUP,
      },
    );
  }

  private async _addTeamSection() {
    const isMatchFun = (model: Group) => {
      const groupState: GroupStateModel = getEntity(
        ENTITY_NAME.GROUP_STATE,
        model.id,
      );
      const hasUnread =
        groupState && groupState.unreadCount
          ? groupState.unreadCount > 0
          : false;
      const isTeamInTeamSection = model.is_team as boolean;
      const userId = getGlobalValue(GLOBAL_KEYS.CURRENT_USER_ID);
      const includesMe = userId && _.includes(model.members, userId);
      const groupService = ServiceLoader.getInstance<GroupService>(
        ServiceConfig.GROUP_SERVICE,
      );
      return (
        this._oldFavGroupIds.indexOf(model.id) === -1 &&
        (this._hiddenGroupIds.indexOf(model.id) === -1 || hasUnread) &&
        isTeamInTeamSection &&
        includesMe &&
        groupService.isValid(model)
      );
    };
    return this._addSection(SECTION_TYPE.TEAM, GROUP_QUERY_TYPE.TEAM, {
      isMatchFunc: isMatchFun,
      transformFunc: groupTransformFunc,
      entityName: ENTITY_NAME.GROUP,
      eventName: undefined, // it should not subscribe notification by itself
      limit: MAX_LEFT_RAIL_WITH_OPEN_GROUP,
    });
  }

  async fetchGroups(sectionType: SECTION_TYPE, direction: QUERY_DIRECTION) {
    if (this._handlersMap[sectionType]) {
      const performanceKey = this._getPerformanceKey(sectionType);
      const performanceTracer = PerformanceTracer.start();
      const groups =
        (await this._handlersMap[sectionType].fetchData(direction)) || [];
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
          groups.forEach(async (group: Group) => {
            const state = await stateService.getById(group.id);
            this._addToFetchDependUnread(group.id, state, sectionType);
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
    preFetchConversationDataHandler.addProcessor(groupId);
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

  private async _removeOverLimitGroupByChangingCurrentGroupId(
    type: SECTION_TYPE,
    limit: number,
    lastGroupId: number,
  ) {
    const lastGroupIndex = this.getGroupIdsByType(type).indexOf(lastGroupId);
    if (lastGroupIndex >= limit) {
      const result = await !this._hasUnreadInGroups([lastGroupId]);
      if (result) {
        this._removeByIds(type, [lastGroupId]);
      }
    }
  }

  private _removeByIds(type: SECTION_TYPE, ids: number[]) {
    if (ids.length === 0) return;

    const handler = this._handlersMap[type];
    handler.removeByIds(ids);
  }

  private async _getStates(groupIds: number[]): Promise<GroupState[]> {
    const stateService = ServiceLoader.getInstance<StateService>(
      ServiceConfig.STATE_SERVICE,
    );
    const states = await stateService.getGroupStatesFromLocalWithUnread(
      groupIds,
    );
    return states || [];
  }

  private async _hasUnreadInGroups(groupIds: number[]) {
    return (await this._getStates(groupIds)).length === 0;
  }

  async removeOverLimitGroupByChangingCurrentGroupId() {
    const currentId = getGlobalValue(GLOBAL_KEYS.CURRENT_CONVERSATION_ID);
    const lastGroupId = this._lastGroupId;
    const limit = await this._getMaxLeftRailGroup();
    mainLogger
      .tags(LOG_TAG)
      .info(`removeOverLimitGroupByChangingCurrentGroupId limit: ${limit}`);
    if (currentId !== lastGroupId) {
      await this._removeOverLimitGroupByChangingCurrentGroupId(
        SECTION_TYPE.DIRECT_MESSAGE,
        limit,
        lastGroupId,
      );
      await this._removeOverLimitGroupByChangingCurrentGroupId(
        SECTION_TYPE.TEAM,
        limit,
        lastGroupId,
      );
      this._lastGroupId = currentId;
    }
  }

  private async _removeOverLimitGroupByChangingIds(
    type: SECTION_TYPE,
    originalIds: number[],
    limit: number,
  ) {
    const stateService = ServiceLoader.getInstance<StateService>(
      ServiceConfig.STATE_SERVICE,
    );
    const states =
      (await stateService.getGroupStatesFromLocalWithUnread(originalIds)) || [];
    const ids = this.getRemovedIds(
      states,
      originalIds,
      limit,
      this._lastGroupId,
    );
    this._removeByIds(type, ids);
  }
  /*
  FIJI-1269
  */
  async removeOverLimitGroupByChangingIds() {
    // 1. observe current group change
    // 2. check overflew groups
    // 3. remove from list

    if (this._lastGroupId === 0) {
      return;
    }
    const directIds = this.getGroupIdsByType(SECTION_TYPE.DIRECT_MESSAGE);
    const teamIds = this.getGroupIdsByType(SECTION_TYPE.TEAM);
    const limit = await this._getMaxLeftRailGroup();
    mainLogger
      .tags(LOG_TAG)
      .info(`removeOverLimitGroupByChangingIds limit: ${limit}`);
    await this._removeOverLimitGroupByChangingIds(
      SECTION_TYPE.DIRECT_MESSAGE,
      directIds,
      limit,
    );
    await this._removeOverLimitGroupByChangingIds(
      SECTION_TYPE.TEAM,
      teamIds,
      limit,
    );
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
    return count > MAX_LEFT_RAIL_GROUP ? MAX_LEFT_RAIL_GROUP : count;
  }
}

export default SectionGroupHandler;
