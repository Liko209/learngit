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
import { Group, Profile } from 'sdk/models';

import { SECTION_TYPE } from '@/containers/LeftRail/Section/types';
import { ENTITY_NAME, GLOBAL_KEYS } from '@/store/constants';
import { IAtom, createAtom, autorun } from 'mobx';
import { getSingleEntity } from '@/store/utils';
import ProfileModel from '@/store/models/Profile';
import _ from 'lodash';
import storeManager from '@/store';
import history from '@/history';
import { NotificationEntityPayload } from 'sdk/src/service/notificationCenter';

const { GroupService } = service;

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
  private _handlersMap: {} = {};

  private _idSet: Set<number>;
  private _idSetAtom: IAtom;
  private _oldFavGroupIds: number[] = [];
  private static _instance: SectionGroupHandler | undefined = undefined;
  private _hiddenGroupIds: number[] = [];
  constructor() {
    super();
    this._idSetAtom = createAtom(`SectionGroupHandler: ${Math.random()}`);
    this._initHandlerMap();
    this._idSet = new Set<number>();
    this._subscribeNotification();
    autorun(() => this._profileUpdateGroupSections());
    autorun(() => this._updateHiddenGroupIds());
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
      Object.keys(this._handlersMap).forEach((key: string) => {
        this._handlersMap[key].removeByIds(inters);
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
        this._handlersMap[SECTION_TYPE.FAVORITE].removeByIds(more);
      }
      if (less.length) {
        result = await groupService.getGroupsByIds(less);
        this._handlersMap[SECTION_TYPE.DIRECT_MESSAGE].removeByIds(less);
        this._handlersMap[SECTION_TYPE.TEAM].removeByIds(less);
        this._handlersMap[SECTION_TYPE.FAVORITE].upsert(result);
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
    new FetchSortableDataListHandler(dataProvider, config);
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

  getAllGroupIds() {
    this._idSetAtom.reportObserved();
    return Array.from(this._idSet) || [];
  }

  groupIds(type: SECTION_TYPE) {
    const ids = this._handlersMap[type]
      ? this._handlersMap[type].sortableListStore.getIds()
      : [];
    return ids;
  }
}

export default SectionGroupHandler;
