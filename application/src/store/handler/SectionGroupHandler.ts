/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2018-10-24 13:25:32
 * Copyright © RingCentral. All rights reserved.
 */

import {
  FetchSortableDataListHandler,
  IFetchSortableDataProvider,
  FetchDataDirection,
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
import { NotificationEntityPayload } from 'sdk/src/service/notificationCenter';

const { GroupService, StateService, ProfileService } = service;

function groupTransformFunc(data: Group): ISortableModel<Group> {
  return {
    id: data.id,
    sortValue: -(data.most_recent_post_created_at || data.created_at),
  };
}

class GroupDataProvider implements IFetchSortableDataProvider<Group> {
  private _queryType: GROUP_QUERY_TYPE;

  constructor(queryType: GROUP_QUERY_TYPE) {
    this._queryType = queryType;
  }

  async fetchData(
    offset: number,
    direction: FetchDataDirection,
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
  constructor() {
    super();
    this._idSetAtom = createAtom(`SectionGroupHandler: ${Math.random()}`);
    this._initHandlerMap();
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

  private _updateHiddenGroupIds() {
    const hiddenGroupIds = getSingleEntity<Profile, ProfileModel>(
      ENTITY_NAME.PROFILE,
      'hiddenGroupIds',
    );
    this._hiddenGroupIds = (hiddenGroupIds && hiddenGroupIds.get()) || [];
    this._removeGroupsIfExistedInHiddenGroups();
  }

  private _removeGroupsIfExistedInHiddenGroups() {
    const inters = _.intersection(this._hiddenGroupIds, [...this._idSet]);
    if (inters.length) {
      inters.forEach(id => this._idSet.delete(id));
      Object.keys(this._handlersMap).forEach((key: SECTION_TYPE) => {
        this._removeByIds(key, inters);
      });
      this._updateUrl(EVENT_TYPES.DELETE, inters);
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

      let result: Group[];
      if (more.length) {
        result = await groupService.getGroupsByIds(more);
        this._handlersMap[SECTION_TYPE.DIRECT_MESSAGE].upsert(result);
        this._handlersMap[SECTION_TYPE.TEAM].upsert(result);
      }
      if (less.length) {
        result = await groupService.getGroupsByIds(less);
        this._handlersMap[SECTION_TYPE.DIRECT_MESSAGE].removeByIds(less);
        this._handlersMap[SECTION_TYPE.TEAM].removeByIds(less);
        let shouldReportChanged = false;
        less.forEach((id: number) => {
          if (!this._idSet.has(id)) {
            this._idSet.add(id);
            shouldReportChanged = true;
          }
        });
        shouldReportChanged && this._idSetAtom.reportChanged();
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
    payload.body.entities.forEach((state: GroupState) => {
      const hasUnread =
        state.marked_as_unread ||
        state.unread_count ||
        state.unread_mentions_count;
      if (hasUnread) {
        unreadIds.push(state.id);
      }
    });

    const diff = _.difference(unreadIds, [...this._idSet]);
    if (diff.length) {
      const groupService = GroupService.getInstance<service.GroupService>();
      const result = await groupService.getGroupsByIds(diff);
      this._handlersMap[SECTION_TYPE.DIRECT_MESSAGE].upsert(result);
      this._handlersMap[SECTION_TYPE.TEAM].upsert(result);
      this._updateIdSet(EVENT_TYPES.UPDATE, diff);
    }
  }

  private _updateUrl(type: EVENT_TYPES, ids: number[]) {
    if (type === EVENT_TYPES.DELETE) {
      const currentGroupId = storeManager
        .getGlobalStore()
        .get(GLOBAL_KEYS.CURRENT_CONVERSATION_ID);
      if (_.findIndex(ids, currentGroupId) !== -1) {
        history.replace('/messages');
      }
    }
  }

  private _initHandlerMap() {
    this._addFavoriteSection();
    this._addDirectMessageSection();
    this._addTeamSection();
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
    this.fetchGroups(sectionType, FetchDataDirection.DOWN);
  }

  private _addFavoriteSection() {
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
    this._addSection(SECTION_TYPE.FAVORITE, GROUP_QUERY_TYPE.FAVORITE, {
      isMatchFunc: isMatchFun,
      transformFunc: transformFun,
      entityName: ENTITY_NAME.GROUP,
      eventName: undefined, // it should not subscribe notification by itself
    });
  }
  private _addDirectMessageSection() {
    const isMatchFun = (model: Group) => {
      const notInFav =
        this._oldFavGroupIds.indexOf(model.id) === -1 &&
        this._hiddenGroupIds.indexOf(model.id) === -1;
      const isDirectInDirectSection = !model.is_team;
      return notInFav && isDirectInDirectSection;
    };
    this._addSection(SECTION_TYPE.DIRECT_MESSAGE, GROUP_QUERY_TYPE.GROUP, {
      isMatchFunc: isMatchFun,
      transformFunc: groupTransformFunc,
      entityName: ENTITY_NAME.GROUP,
      eventName: undefined, // it should not subscribe notification by itself
    });
  }
  private _addTeamSection() {
    const isMatchFun = (model: Group) => {
      const notInFav =
        this._oldFavGroupIds.indexOf(model.id) === -1 &&
        this._hiddenGroupIds.indexOf(model.id) === -1;
      const isTeamInTeamSection = model.is_team as boolean;
      return notInFav && isTeamInTeamSection;
    };
    this._addSection(SECTION_TYPE.TEAM, GROUP_QUERY_TYPE.TEAM, {
      isMatchFunc: isMatchFun,
      transformFunc: groupTransformFunc,
      entityName: ENTITY_NAME.GROUP,
      eventName: undefined, // it should not subscribe notification by itself
    });
  }

  async fetchGroups(sectionType: SECTION_TYPE, direction: FetchDataDirection) {
    if (this._handlersMap[sectionType]) {
      await this._handlersMap[sectionType].fetchData(direction);
      const ids = this._handlersMap[sectionType].sortableListStore.getIds();
      ids.forEach((id: number) => {
        this._idSet.add(id);
      });

      if (ids.length) {
        this._idSetAtom.reportChanged();
      }
    }
  }

  getRemovedIds(
    states: GroupState[],
    groupIds: number[],
    limit: number,
    currentGroupId: number,
  ) {
    const removedIds = [];
    const stateIds = states.map((state: GroupState) => state.id);
    for (let i = limit; i < groupIds.length; i++) {
      if (
        stateIds.indexOf(groupIds[i]) === -1 &&
        currentGroupId !== groupIds[i]
      ) {
        removedIds.push(groupIds[i]);
      }
    }
    return removedIds;
  }

  private async _removeOverLimitGroupByChangingCurrentGroupId(
    type: SECTION_TYPE,
    limit: number,
  ) {
    const lastGroupIndex = this.getGroupIds(type).indexOf(this._lastGroupId);
    if (lastGroupIndex >= limit) {
      if (!this._hasUnreadInGroups([this._lastGroupId])) {
        this._removeByIds(type, [this._lastGroupId]);
      }
    }
  }

  private _removeByIds(type: SECTION_TYPE, ids: number[]) {
    if (ids.length === 0) return;

    const handler = this._handlersMap[type];
    handler.removeByIds(ids);
    ids.forEach(id => this._idSet.delete(id));
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
    const limit = await profileService.getMaxLeftRailGroup();
    if (currentId !== this._lastGroupId) {
      await this._removeOverLimitGroupByChangingCurrentGroupId(
        SECTION_TYPE.DIRECT_MESSAGE,
        limit,
      );
      await this._removeOverLimitGroupByChangingCurrentGroupId(
        SECTION_TYPE.TEAM,
        limit,
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
