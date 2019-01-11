/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2018-10-24 13:25:32
 * Copyright © RingCentral. All rights reserved.
 */

import {
  FetchSortableDataListHandler,
  IFetchSortableDataProvider,
  ISortableModel,
  IFetchSortableDataListHandlerOptions,
} from '@/store/base/fetch';
import BaseNotificationSubscribable from '@/store/base/BaseNotificationSubscribable';
import { service } from 'sdk';
import { GROUP_QUERY_TYPE, ENTITY, EVENT_TYPES } from 'sdk/service';
import { Group, Profile, GroupState } from 'sdk/models';

import { SECTION_TYPE } from '@/containers/LeftRail/Section/types';
import { ENTITY_NAME, GLOBAL_KEYS } from '@/store/constants';
import { IAtom, createAtom, autorun, observable } from 'mobx';
import { getSingleEntity, getGlobalValue } from '@/store/utils';
import ProfileModel from '@/store/models/Profile';
import _ from 'lodash';
import storeManager from '@/store';
import history from '@/history';
import { NotificationEntityPayload } from 'sdk/service/notificationCenter';
import { QUERY_DIRECTION } from 'sdk/dao';

const { GroupService, StateService, ProfileService } = service;

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
  private _stateService: service.StateService = StateService.getInstance();

  private _handlersMap: {} = {};
  private _idSet: Set<number>;
  private _idSetAtom: IAtom;
  private _oldFavGroupIds: number[] = [];
  private static _instance: SectionGroupHandler | undefined = undefined;
  private _hiddenGroupIds: number[] = [];
  @observable
  private _lastGroupId: number = 0;
  private _dataLoader: Promise<any>;
  private _lastClosedGroupId: number;
  constructor() {
    super();
    this._dataLoader = this._initHandlerMap();
    this._idSetAtom = createAtom(`SectionGroupHandler: ${Math.random()}`);
    this._idSet = new Set<number>();
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

  onReady(handler: () => any) {
    this._dataLoader = this._dataLoader.then(handler);
  }

  private _updateHiddenGroupIds() {
    const hiddenGroupIds = getSingleEntity<Profile, ProfileModel>(
      ENTITY_NAME.PROFILE,
      'hiddenGroupIds',
    );
    const newIds = (hiddenGroupIds && hiddenGroupIds.get()) || [];
    this.checkIfGroupOpenedFromHidden(this._hiddenGroupIds, newIds);
    this._hiddenGroupIds = newIds;
    this._removeGroupsIfExistedInHiddenGroups();
  }

  isInSection(id: number) {
    return this._idSet.has(id);
  }
  // FIJI-1662
  async checkIfGroupOpenedFromHidden(oldIds: number[], newIds: number[]) {
    const ids = _.difference(oldIds, newIds);
    if (ids.length) {
      await this._changeGroupsInGroupSections(ids, true);
      this._updateIdSet(EVENT_TYPES.UPDATE, ids);
    }
  }

  private _removeGroupsIfExistedInHiddenGroups() {
    const inters = _.intersection(this._hiddenGroupIds, [...this._idSet]);
    if (inters.length) {
      this._updateIdSet(EVENT_TYPES.DELETE, inters);
      Object.keys(this._handlersMap).forEach((key: SECTION_TYPE) => {
        this._removeByIds(key, inters);
      });
      this._updateUrl(EVENT_TYPES.DELETE, inters);
    }
  }

  private async _changeGroupsInGroupSections(
    groupIds: number[],
    shouldAdd: boolean,
  ) {
    if (shouldAdd) {
      const groupService = GroupService.getInstance<service.GroupService>();
      const groups = await groupService.getGroupsByIds(groupIds);
      this._handlersMap[SECTION_TYPE.DIRECT_MESSAGE].upsert(groups);
      this._handlersMap[SECTION_TYPE.TEAM].upsert(groups);
    } else {
      this._handlersMap[SECTION_TYPE.DIRECT_MESSAGE].removeByIds(groupIds);
      this._handlersMap[SECTION_TYPE.TEAM].removeByIds(groupIds);
    }
  }

  private async _profileUpdateGroupSections() {
    const newFavIds =
      getSingleEntity<Profile, ProfileModel>(
        ENTITY_NAME.PROFILE,
        'favoriteGroupIds',
      ) || [];
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
        this._updateIdSet(EVENT_TYPES.UPDATE, less);
      }
    }
  }

  private _updateIdSet(type: EVENT_TYPES, ids: number[]) {
    let isChanged: boolean = false;
    if (type === EVENT_TYPES.DELETE) {
      ids.forEach((id: number) => {
        if (this._idSet.has(id)) {
          isChanged = true;
          this._idSet.delete(id);
        }
      });
    } else if (type === EVENT_TYPES.UPDATE) {
      ids.forEach((id: number) => {
        if (!this._idSet.has(id) && this._hiddenGroupIds.indexOf(id) === -1) {
          this._idSet.add(id);
          isChanged = true;
        }
      });
    }
    if (isChanged) {
      this._idSetAtom.reportChanged();
    }
  }

  private _subscribeNotification() {
    this.subscribeNotification(
      ENTITY.GROUP,
      (payload: NotificationEntityPayload<Group>) => {
        const keys = Object.keys(this._handlersMap);
        let ids: number[] = [];
        if (
          payload.type === EVENT_TYPES.DELETE ||
          payload.type === EVENT_TYPES.UPDATE
        ) {
          ids = payload.body!.ids!;
        }
        // update url
        this._updateUrl(payload.type, ids);
        // handle id sets
        this._updateIdSet(payload.type, ids);
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
    const diff = _.difference(ids, [...this._idSet]);
    if (diff.length) {
      await this._changeGroupsInGroupSections(diff, true);
      this._updateIdSet(EVENT_TYPES.UPDATE, diff);
    }
  }

  private async _handleWithoutUnread(ids: number[]) {
    const diff = _.intersection(ids, [...this._idSet]);
    if (!diff.length) {
      return;
    }
    const profileService = ProfileService.getInstance<service.ProfileService>();
    const limit = await profileService.getMaxLeftRailGroup();
    const idsShouldBeRemoved: number[] = [];
    const directIds = this.getGroupIds(SECTION_TYPE.DIRECT_MESSAGE);
    const teamIds = this.getGroupIds(SECTION_TYPE.TEAM);
    diff.forEach((id: number) => {
      if (directIds.indexOf(id) >= limit || teamIds.indexOf(id) >= limit) {
        idsShouldBeRemoved.push(id);
      }
    });
    this._removeByIds(SECTION_TYPE.DIRECT_MESSAGE, idsShouldBeRemoved);
    this._removeByIds(SECTION_TYPE.TEAM, idsShouldBeRemoved);
  }

  private async _handleIncomesGroupState(
    payload: NotificationEntityPayload<GroupState>,
  ) {
    if (
      payload.type !== EVENT_TYPES.UPDATE ||
      !payload.body.entities ||
      this._idSet.size === 0
    ) {
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
        this._lastClosedGroupId = currentGroupId;
      }
    }
    if (type === EVENT_TYPES.UPDATE) {
      if (this._lastClosedGroupId && !currentGroupId) {
        history.replace(`/messages/${this._lastClosedGroupId}`);
        delete this._lastClosedGroupId;
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
      return (
        this._oldFavGroupIds.indexOf(model.id) !== -1 &&
        this._hiddenGroupIds.indexOf(model.id) === -1
      );
    };
    const transformFun = (model: Group) => {
      return {
        id: model.id,
        sortValue: this._oldFavGroupIds.indexOf(model.id),
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
      const includesMe =
        userId && model.members ? model.members.includes(userId) : true;
      return notInFav && isTeamInTeamSection && includesMe;
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
      await this._handlersMap[sectionType].fetchData(direction);
      const ids = this._handlersMap[sectionType].sortableListStore.getIds();
      this._updateIdSet(EVENT_TYPES.UPDATE, ids);
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
    const lastGroupIndex = this.getGroupIds(type).indexOf(lastGroupId);
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
    this._updateIdSet(EVENT_TYPES.DELETE, ids);
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
    const stateService = StateService.getInstance<service.StateService>();
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
    const directIds = this.getGroupIds(SECTION_TYPE.DIRECT_MESSAGE);
    const teamIds = this.getGroupIds(SECTION_TYPE.TEAM);
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

  getAllGroupIds() {
    this._idSetAtom.reportObserved();
    return Array.from(this._idSet) || [];
  }

  getGroupIds(type: SECTION_TYPE) {
    const ids = this._handlersMap[type]
      ? this._handlersMap[type].sortableListStore.getIds()
      : [];
    return ids;
  }
}

export default SectionGroupHandler;
