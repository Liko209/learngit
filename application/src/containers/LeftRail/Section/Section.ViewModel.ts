/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2018-08-22 15:21:30
 * Copyright © RingCentral. All rights reserved.
 */
import { computed, observable } from 'mobx';
import { service } from 'sdk';
import { GROUP_QUERY_TYPE, ENTITY } from 'sdk/service';
import { Group } from 'sdk/models';
import { ENTITY_NAME } from '@/store';
import _ from 'lodash';
import {
  SectionProps,
  SectionConfig,
  SectionConfigs,
  SectionViewProps,
} from './types';
import { SECTION_TYPE } from './constants';
import ISortableModel from '../../../store/base/fetch/ISortableModel';

import { FetchDataDirection } from '../../../store/base/fetch/constants';
import { ISortFunc } from '../../../store/base/fetch/SortableListStore';

import FetchSortableDataListHandler, {
  IFetchSortableDataProvider,
} from '../../../store/base/fetch/FetchSortableDataListHandler';

const { GroupService } = service;

function groupTransformFunc(data: Group): ISortableModel<Group> {
  return {
    id: data.id,
    sortValue: -(data.most_recent_post_created_at || data.created_at),
  };
}

const SECTION_CONFIGS: SectionConfigs = {
  [SECTION_TYPE.FAVORITE]: {
    title: 'favorite_plural',
    iconName: 'start',
    entity: ENTITY.FAVORITE_GROUPS,
    entityName: ENTITY_NAME.GROUP,
    queryType: GROUP_QUERY_TYPE.FAVORITE,
    transformFun: groupTransformFunc,
    isMatchFun: (model: Group) => {
      return false;
    },
  },
  [SECTION_TYPE.DIRECT_MESSAGE]: {
    title: 'directMessage_plural',
    iconName: 'people',
    entity: ENTITY.PEOPLE_GROUPS,
    entityName: ENTITY_NAME.GROUP,
    queryType: GROUP_QUERY_TYPE.GROUP,
    transformFun: groupTransformFunc,
    isMatchFun: (model: Group) => {
      return !model.is_team;
    },
  },
  [SECTION_TYPE.TEAM]: {
    title: 'team_plural',
    iconName: 'people',
    entity: ENTITY.TEAM_GROUPS,
    entityName: ENTITY_NAME.GROUP,
    queryType: GROUP_QUERY_TYPE.TEAM,
    transformFun: groupTransformFunc,
    isMatchFun: (model: Group) => {
      return model.is_team || false;
    },
  },
};

class GroupDataProvider implements IFetchSortableDataProvider<Group> {
  private _queryType: GROUP_QUERY_TYPE;
  constructor(queryType: GROUP_QUERY_TYPE) {
    this._queryType = queryType;
  }

  fetchData(
    offset: number,
    direction: FetchDataDirection,
    pageSize: number,
    anchor: ISortableModel<Group> | null,
  ): Promise<Group[]> {
    const groupService = GroupService.getInstance<service.GroupService>();
    return groupService.getGroupsByType(this._queryType);
  }
}

const sortFunc: ISortFunc<ISortableModel<Group>> = (
  first: ISortableModel<Group>,
  second: ISortableModel<Group>,
) => first.sortValue - second.sortValue;

// const isMatchFunc: IMatchFunc<Group> = (model: Group) => true;

class SectionViewModel implements SectionViewProps {
  private _listHandler: FetchSortableDataListHandler<Group>;

  @observable
  private _type: SECTION_TYPE;

  @observable
  private _config: SectionConfig;

  @computed
  get iconName() {
    return this._config.iconName;
  }

  @computed
  get title() {
    return this._config.title;
  }

  @computed
  get groupIds() {
    return this._listHandler.sortableListStore.getIds();
  }

  sortable: boolean = false;
  expanded: boolean = false;

  onSortEnd = ({
    oldIndex,
    newIndex,
  }: {
    oldIndex: number;
    newIndex: number;
  }) => {
    return this.handleSortEnd(oldIndex, newIndex);
  }

  async onReceiveProps(props: SectionProps) {
    if (this._type === props.type) return;

    this._type = props.type;
    this._config = SECTION_CONFIGS[this._type];

    const dataProvider = new GroupDataProvider(this._config.queryType);

    this._listHandler = new FetchSortableDataListHandler(dataProvider, {
      sortFunc,
      isMatchFunc: this._config.isMatchFun,
      transformFunc: groupTransformFunc,
      entityName: ENTITY_NAME.GROUP,
      eventName: this._config.entity,
    });
    await this.fetchGroups();
  }

  async fetchGroups() {
    await this._listHandler.fetchData(FetchDataDirection.DOWN);
  }

  handleSortEnd(oldIndex: number, newIndex: number) {
    const groupService = GroupService.getInstance<service.GroupService>();
    groupService.reorderFavoriteGroups(oldIndex, newIndex);
  }
}

export default SectionViewModel;
export { SectionViewModel };
