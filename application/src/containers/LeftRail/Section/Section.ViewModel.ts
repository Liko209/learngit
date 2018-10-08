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
  SECTION_TYPE,
} from './types';
import { AbstractViewModel } from '@/base';

import {
  FetchSortableDataListHandler,
  IFetchSortableDataProvider,
  FetchDataDirection,
  ISortableModel,
} from '@/store/base/fetch';

const { GroupService } = service;

function groupTransformFunc(data: Group): ISortableModel<Group> {
  return {
    id: data.id,
    sortValue: -(data.most_recent_post_created_at || data.created_at),
  };
}

function favGroupTransformFunc(data: Group): ISortableModel<Group> {
  return {
    id: data.id,
    sortValue: 0,
  };
}

const SECTION_CONFIGS: SectionConfigs = {
  [SECTION_TYPE.FAVORITE]: {
    title: 'favorite_plural',
    iconName: 'start',
    eventName: ENTITY.FAVORITE_GROUPS,
    entityName: ENTITY_NAME.GROUP,
    queryType: GROUP_QUERY_TYPE.FAVORITE,
    transformFun: favGroupTransformFunc,
    isMatchFun: (model: Group) => {
      return true;
    },
  },
  [SECTION_TYPE.DIRECT_MESSAGE]: {
    title: 'directMessage_plural',
    iconName: 'people',
    eventName: ENTITY.PEOPLE_GROUPS,
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
    eventName: ENTITY.TEAM_GROUPS,
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

class SectionViewModel extends AbstractViewModel implements SectionViewProps {
  private _listHandler: FetchSortableDataListHandler<Group>;

  @observable
  private _type: SECTION_TYPE;

  @observable
  private _config: SectionConfig;

  @observable
  currentGroupId: number;

  @observable
  expanded: boolean = true;

  @observable
  sortable: boolean = false;

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
    if (this.currentGroupId !== props.currentGroupId) {
      this.currentGroupId = props.currentGroupId;
    }

    if (this._type === props.type) return;

    if (this._listHandler) {
      this._listHandler.dispose();
    }

    this._type = props.type;
    this._config = SECTION_CONFIGS[this._type];

    const dataProvider = new GroupDataProvider(this._config.queryType);

    this._listHandler = new FetchSortableDataListHandler(dataProvider, {
      isMatchFunc: this._config.isMatchFun,
      transformFunc: this._config.transformFun,
      entityName: ENTITY_NAME.GROUP,
      eventName: this._config.eventName,
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
