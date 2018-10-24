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
import { ENTITY_NAME } from '@/store/constants';
import { computed, IAtom, createAtom } from 'mobx';
import { getSingleEntity } from '@/store/utils';
import ProfileModel from '@/store/models/Profile';
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
  constructor() {
    super();
    this._idSetAtom = createAtom(`SectionGroupHandler: ${Math.random()}`);
    this._initHandlerMap();
    this._idSet = new Set<number>();
    this._subscribeNotification();
  }

  static getInstance() {
    if (!this._instance) {
      this._instance = new SectionGroupHandler();
    }
    return this._instance;
  }

  @computed
  get favGroupIds() {
    return (
      getSingleEntity<Profile, ProfileModel>(
        ENTITY_NAME.PROFILE,
        'favoriteGroupIds',
      ) || []
    );
  }

  async profileUpdateGroupSections() {}

  private _updateIdSet(type: EVENT_TYPES, entities: Map<number, any>) {
    const strIds = Object.keys(entities);
    const ids = strIds.map(id => Number(id));
    if (type === EVENT_TYPES.REPLACE_ALL) {
      this._idSet = new Set(ids);
    } else if (type === EVENT_TYPES.DELETE) {
      ids.forEach(id => this._idSet.delete(id));
    } else if (type === EVENT_TYPES.PUT) {
      ids.forEach(id => this._idSet.add(id));
    }

    const isChanged =
      type === EVENT_TYPES.REPLACE_ALL ||
      type === EVENT_TYPES.DELETE ||
      type === EVENT_TYPES.PUT;

    if (isChanged) {
      this._idSetAtom.reportChanged();
    }
  }

  private _subscribeNotification() {
    this.subscribeNotification(ENTITY.GROUP, ({ type, entities }) => {
      const keys = Object.keys(this._handlersMap);
      // handle id sets
      this._updateIdSet(type, entities);
      keys.forEach((key: string) => {
        this._handlersMap[key].onDataChanged({ type, entities });
      });
    });
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
      return this._oldFavGroupIds.indexOf(model.id) !== -1;
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
      entityName: undefined, // it should not subscribe notification by itself
      eventName: ENTITY.FAVORITE_GROUPS,
    });
  }
  private _addDirectMessageSection() {
    const isMatchFun = (model: Group) => {
      const notInFav = this._oldFavGroupIds.indexOf(model.id) === -1;
      const isDirectInDirectSection = !model.is_team;
      return notInFav && isDirectInDirectSection;
    };
    this._addSection(SECTION_TYPE.DIRECT_MESSAGE, GROUP_QUERY_TYPE.GROUP, {
      isMatchFunc: isMatchFun,
      transformFunc: groupTransformFunc,
      entityName: undefined, // it should not subscribe notification by itself
      eventName: ENTITY.PEOPLE_GROUPS,
    });
  }
  private _addTeamSection() {
    const isMatchFun = (model: Group) => {
      const notInFav = this._oldFavGroupIds.indexOf(model.id) === -1;
      const isTeamInTeamSection = model.is_team as boolean;
      return notInFav && isTeamInTeamSection;
    };
    this._addSection(SECTION_TYPE.TEAM, GROUP_QUERY_TYPE.TEAM, {
      isMatchFunc: isMatchFun,
      transformFunc: groupTransformFunc,
      entityName: undefined, // it should not subscribe notification by itself
      eventName: ENTITY.TEAM_GROUPS,
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
