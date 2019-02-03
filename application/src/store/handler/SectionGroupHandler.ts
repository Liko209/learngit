/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2018-10-24 13:25:32
 * Copyright © RingCentral. All rights reserved.
 */

import {
  FetchSortableDataListHandler,
  IFetchSortableDataProvider,
  IFetchSortableDataListHandlerOptions,
  ISortableModel,
} from '@/store/base/fetch';
import BaseNotificationSubscribable from '@/store/base/BaseNotificationSubscribable';
import { service } from 'sdk';
import { GROUP_QUERY_TYPE, ENTITY, EVENT_TYPES } from 'sdk/service';
import { Group } from 'sdk/module/group/entity';
import { Profile } from 'sdk/module/profile/entity';
import { GroupState } from 'sdk/models';

import { SECTION_TYPE } from '@/containers/LeftRail/Section/types';
import { ENTITY_NAME, GLOBAL_KEYS } from '@/store/constants';
import { autorun, observable, computed } from 'mobx';
import { getSingleEntity, getGlobalValue } from '@/store/utils';
import ProfileModel from '@/store/models/Profile';
import _ from 'lodash';
import storeManager from '@/store';
import history from '@/history';
import { NotificationEntityPayload } from 'sdk/service/notificationCenter';
import { QUERY_DIRECTION } from 'sdk/dao';
import { PerformanceTracerHolder, PERFORMANCE_KEYS } from 'sdk/utils';
import { StateService } from 'sdk/module/state';

const { GroupService, ProfileService } = service;

function groupTransformFunc(data: Group): ISortableModel<Group> {
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
  private _queryType: GROUP_QUERY_TYPE;

  constructor(queryType: GROUP_QUERY_TYPE) {
    this._queryType = queryType;
  }

  async fetchData(
    direction: QUERY_DIRECTION,
    pageSize: number,
    anchor: ISortableModel<Group>,
  ): Promise<{ data: Group[]; hasMore: boolean }> {
    const groupService = GroupService.getInstance<service.GroupService>();
    const result = await groupService.getGroupsByType(this._queryType);
    return { data: result, hasMore: false };
  }
}

class SectionGroupHandler extends BaseNotificationSubscribable {
  private _stateService: StateService = StateService.getInstance();

  private _handlersMap: {} = {};
  private _oldFavGroupIds: number[] = [];
  private static _instance: SectionGroupHandler | undefined = undefined;
  private _hiddenGroupIds: number[] = [];
  @observable
  private _lastGroupId: number = 0;
  private _dataLoader: Promise<any>;
  private _initFavorites = false;
  constructor() {
    super();
    this._dataLoader = this._initHandlerMap();
    this._lastGroupId = storeManager
      .getGlobalStore()
      .get(GLOBAL_KEYS.CURRENT_CONVERSATION_ID);
    this._subscribeNotification();
    autorun(() => this._profileUpdateGroupSections());
    autorun(() => this._updateHiddenGroupIds());
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

  private _updateHiddenGroupIds() {
    const hiddenGroupIds = getSingleEntity<Profile, ProfileModel>(
      ENTITY_NAME.PROFILE,
      'hiddenGroupIds',
    );
    const newIds = hiddenGroupIds || [];
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
    Object.keys(this._handlersMap).forEach((key: SECTION_TYPE) => {
      const inters = _.intersection(
        this._hiddenGroupIds,
        this.getGroupIdsByType(key),
      );
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
      const groupService = GroupService.getInstance<service.GroupService>();
      const groups = await groupService.getGroupsByIds(ids);
      this._handlersMap[SECTION_TYPE.DIRECT_MESSAGE].upsert(groups);
      this._handlersMap[SECTION_TYPE.TEAM].upsert(groups);
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
    if (this._oldFavGroupIds.toString() === newFavIds.toString()) {
      return;
    }
    if (!this._initFavorites) {
      this._oldFavGroupIds = newFavIds;
      this._initFavorites = true;
      return;
    }
    if (this._oldFavGroupIds.toString() !== newFavIds.toString()) {
      const more = _.difference(this._oldFavGroupIds, newFavIds); // less fav more groups
      const less = _.difference(newFavIds, this._oldFavGroupIds); // less group more fav
      this._oldFavGroupIds = newFavIds;
      // handle favorite section change
      const groupService = GroupService.getInstance<service.GroupService>();
      const groups = await groupService.getGroupsByType(
        GROUP_QUERY_TYPE.FAVORITE,
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
        const keys = Object.keys(this._handlersMap);
        let ids: number[] = [];
        if (payload.type === EVENT_TYPES.DELETE) {
          ids = payload.body!.ids!;
        } else if (payload.type === EVENT_TYPES.UPDATE) {
          ids = payload.body!.ids!;
          const currentUserId = getGlobalValue(GLOBAL_KEYS.CURRENT_USER_ID);
          ids = ids.filter((id: number) => {
            const group = payload.body.entities.get(id);
            return (
              !group ||
              !_.includes(group.members, currentUserId) ||
              group.is_archived
            );
          });
        }
        // update url
        this._updateUrl(EVENT_TYPES.DELETE, ids);
        keys.forEach((key: string) => {
          this._handlersMap[key].onDataChanged(payload);
        });
      },
    );
    this.subscribeNotification(
      ENTITY.GROUP_STATE,
      (payload: NotificationEntityPayload<GroupState>) => {
        this._handleIncomesGroupState(payload);
      },
    );
  }

  private async _handleWithUnread(ids: number[]) {
    await this._changeGroupsInGroupSections(ids, true);
  }

  private async _handleWithoutUnread(ids: number[]) {
    const intersectionIds = _.intersection(ids, this.groupIdsExcludeFavorites);
    if (!intersectionIds.length) {
      return;
    }
    this._remove(intersectionIds, true);
  }

  private async _remove(ids: number[], checkLimit: boolean = false) {
    let limit = 0;
    if (checkLimit) {
      const profileService: service.ProfileService = ProfileService.getInstance();
      limit = await profileService.getMaxLeftRailGroup();
    }
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

  private async _handleIncomesGroupState(
    payload: NotificationEntityPayload<GroupState>,
  ) {
    if (payload.type !== EVENT_TYPES.UPDATE || !payload.body.entities) {
      return;
    }

    const unreadIds: number[] = [];
    const withoutUnreadIds: number[] = [];
    const currentId = getGlobalValue(GLOBAL_KEYS.CURRENT_CONVERSATION_ID);

    payload.body.entities.forEach((state: GroupState) => {
      const hasUnread =
        state.marked_as_unread ||
        state.unread_count ||
        state.unread_mentions_count;
      if (hasUnread) {
        unreadIds.push(state.id);
      } else if (currentId !== state.id) {
        withoutUnreadIds.push(state.id);
      }
    });

    this._handleWithUnread(unreadIds);
    this._handleWithoutUnread(withoutUnreadIds);
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

  private async _addSection(
    sectionType: SECTION_TYPE,
    queryType: GROUP_QUERY_TYPE,
    config: IFetchSortableDataListHandlerOptions<Group>,
  ) {
    const dataProvider = new GroupDataProvider(queryType);
    this._handlersMap[sectionType] = new FetchSortableDataListHandler(
      dataProvider,
      config,
    );
    return this.fetchGroups(sectionType, QUERY_DIRECTION.NEWER);
  }

  private async _addFavoriteSection() {
    const isMatchFun = (model: Group) => {
      const userId = getGlobalValue(GLOBAL_KEYS.CURRENT_USER_ID);
      const includesMe = userId && _.includes(model.members, userId);
      return (
        this._oldFavGroupIds.indexOf(model.id) !== -1 &&
        this._hiddenGroupIds.indexOf(model.id) === -1 &&
        includesMe &&
        !model.is_archived
      );
    };
    const transformFun = (model: Group) => {
      return {
        id: model.id,
        sortValue: 0,
      } as ISortableModel<Group>;
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
      const notInFav =
        this._oldFavGroupIds.indexOf(model.id) === -1 &&
        this._hiddenGroupIds.indexOf(model.id) === -1;
      const isDirectInDirectSection = !model.is_team;
      const createdByMeOrHasPostTime: boolean =
        model.most_recent_post_created_at !== undefined ||
        model.creator_id === currentUserId;
      return notInFav && isDirectInDirectSection && createdByMeOrHasPostTime;
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
    const isMatchFun = (model: Group) => {
      const notInFav =
        this._oldFavGroupIds.indexOf(model.id) === -1 &&
        this._hiddenGroupIds.indexOf(model.id) === -1;
      const isTeamInTeamSection = model.is_team as boolean;
      const userId = getGlobalValue(GLOBAL_KEYS.CURRENT_USER_ID);
      const includesMe = userId && _.includes(model.members, userId);
      return (
        notInFav && isTeamInTeamSection && includesMe && !model.is_archived
      );
    };
    return this._addSection(SECTION_TYPE.TEAM, GROUP_QUERY_TYPE.TEAM, {
      isMatchFunc: isMatchFun,
      transformFunc: groupTransformFunc,
      entityName: ENTITY_NAME.GROUP,
      eventName: undefined, // it should not subscribe notification by itself
    });
  }

  async fetchGroups(sectionType: SECTION_TYPE, direction: QUERY_DIRECTION) {
    if (this._handlersMap[sectionType]) {
      const performanceKey = this._getPerformanceKey(sectionType);
      const logId = Date.now();
      PerformanceTracerHolder.getPerformanceTracer().start(
        performanceKey,
        logId,
      );
      await this._handlersMap[sectionType].fetchData(direction);
      PerformanceTracerHolder.getPerformanceTracer().end(logId);
    }
  }

  private _getPerformanceKey(sectionType: SECTION_TYPE): string {
    switch (sectionType) {
      case SECTION_TYPE.FAVORITE:
        return PERFORMANCE_KEYS.GROUP_SECTION_FETCH_FAVORITES;

      case SECTION_TYPE.DIRECT_MESSAGE:
        return PERFORMANCE_KEYS.GROUP_SECTION_FETCH_DIRECT_MESSAGES;

      case SECTION_TYPE.TEAM:
        return PERFORMANCE_KEYS.GROUP_SECTION_FETCH_TEAMS;
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
    const states = await this._stateService.getGroupStatesFromLocalWithUnread(
      groupIds,
    );
    return states || [];
  }

  private async _hasUnreadInGroups(groupIds: number[]) {
    return (await this._getStates(groupIds)).length === 0;
  }

  async removeOverLimitGroupByChangingCurrentGroupId() {
    const currentId = getGlobalValue(GLOBAL_KEYS.CURRENT_CONVERSATION_ID);
    const profileService = ProfileService.getInstance<service.ProfileService>();
    const lastGroupId = this._lastGroupId;
    const limit = await profileService.getMaxLeftRailGroup();
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
    const stateService = StateService.getInstance<StateService>();
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
    const profileService = ProfileService.getInstance<service.ProfileService>();
    const directIds = this.getGroupIdsByType(SECTION_TYPE.DIRECT_MESSAGE);
    const teamIds = this.getGroupIdsByType(SECTION_TYPE.TEAM);
    const limit = await profileService.getMaxLeftRailGroup();
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
    const ids = this._handlersMap[type]
      ? this._handlersMap[type].sortableListStore.getIds
      : [];
    return ids;
  }
}

export default SectionGroupHandler;
