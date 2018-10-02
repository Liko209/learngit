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
import OrderListHandler from '@/store/base/OrderListHandler';
import GroupModel from '@/store/models/Group';
import _ from 'lodash';
import {
  SectionProps,
  SectionConfig,
  SectionConfigs,
  SectionViewProps,
} from './types';
import { SECTION_TYPE } from './constants';

const { GroupService } = service;

const indexTransformFun = (dataModel: Group, index: number) => ({
  id: dataModel.id,
  sortKey: index,
});

const mostRecentGroupTransformFun = (dataModel: Group, index: number) => ({
  id: dataModel.id,
  sortKey: -(dataModel.most_recent_post_created_at || dataModel.created_at),
});

const SECTION_CONFIGS: SectionConfigs = {
  // [SECTION_TYPE.UNREAD]: {
  //   title: 'unread',
  //   iconName: 'fiber_new',
  // },
  // [SECTION_TYPE.AT_MENTION]: {
  //   title: 'mention_plural',
  //   iconName: 'alternate_email',
  // },
  // [SECTION_TYPE.BOOKMARK]: {
  //   title: 'bookmark_plural',
  //   iconName: 'bookmark',
  // },
  [SECTION_TYPE.FAVORITE]: {
    title: 'favorite_plural',
    iconName: 'start',
    entity: ENTITY.FAVORITE_GROUPS,
    entityName: ENTITY_NAME.GROUP,
    queryType: GROUP_QUERY_TYPE.FAVORITE,
    transformFun: indexTransformFun,
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
    transformFun: mostRecentGroupTransformFun,
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
    transformFun: mostRecentGroupTransformFun,
    isMatchFun: (model: Group) => {
      return model.is_team;
    },
  },
};

class SectionViewModel implements SectionViewProps {
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
    return this._listHandler.getStore().getIds();
  }

  private _listHandler: OrderListHandler<Group, GroupModel>;

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

    this._listHandler = new OrderListHandler(
      () => true,
      this._config.transformFun || indexTransformFun,
    );

    await this.fetchGroups();

    if (this._config.entity) {
      this._listHandler.subscribeNotification(
        this._config.entity,
        ({ type, entities }) => {
          this._listHandler.handleIncomingData(ENTITY_NAME.GROUP, {
            type,
            entities,
          });
        },
      );
    }
  }

  async fetchGroups() {
    if (this._config.queryType && this._config.entityName) {
      const groupService = GroupService.getInstance<service.GroupService>();
      const groups = await groupService.getGroupsByType(this._config.queryType);

      // TODO dont clear all
      const store = this._listHandler.getStore();
      store.clearAll();

      this._listHandler.handlePageData(this._config.entityName, groups, true);
    }
  }

  handleSortEnd(oldIndex: number, newIndex: number) {
    const groupService = GroupService.getInstance<service.GroupService>();
    groupService.reorderFavoriteGroups(oldIndex, newIndex);
  }
}

export default SectionViewModel;
export { SectionViewModel };
