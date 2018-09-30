/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2018-08-22 15:21:30
 * Copyright © RingCentral. All rights reserved.
 */
import { computed } from 'mobx';
import { service } from 'sdk';
import { GROUP_QUERY_TYPE, ENTITY } from 'sdk/service';
import { Group } from 'sdk/models';
import { ENTITY_NAME } from '@/store';
import OrderListHandler from '@/store/base/OrderListHandler';
import GroupModel from '@/store/models/Group';
import _ from 'lodash';
import { SectionProps, SectionConfig, SectionConfigs } from './types';
import { SECTION_TYPE } from './constants';

const { GroupService } = service;

const DEFAULT_TRANSFORM = (dataModel: Group, index: number) => ({
  id: dataModel.id,
  sortKey: index,
});

const SECTION_CONFIGS: SectionConfigs = {
  [SECTION_TYPE.UNREAD]: {
    title: 'unread',
    iconName: 'fiber_new',
  },
  [SECTION_TYPE.AT_MENTION]: {
    title: 'mention_plural',
    iconName: 'alternate_email',
  },
  [SECTION_TYPE.BOOKMARK]: {
    title: 'bookmark_plural',
    iconName: 'bookmark',
  },
  [SECTION_TYPE.FAVORITE]: {
    title: 'favorite_plural',
    iconName: 'start',
    entity: ENTITY.GROUP,
    entityName: ENTITY_NAME.GROUP,
    queryType: GROUP_QUERY_TYPE.FAVORITE,
  },
  [SECTION_TYPE.DIRECT_MESSAGE]: {
    title: 'directMessage_plural',
    iconName: 'people',
    entity: ENTITY.GROUP,
    entityName: ENTITY_NAME.GROUP,
    queryType: GROUP_QUERY_TYPE.TEAM,
  },
  [SECTION_TYPE.TEAM]: {
    title: 'team_plural',
    iconName: 'people',
    entity: ENTITY.TEAM_GROUPS,
    entityName: ENTITY_NAME.GROUP,
    queryType: GROUP_QUERY_TYPE.TEAM,
  },
};

class SectionViewModel extends OrderListHandler<Group, GroupModel> {
  private _type: SECTION_TYPE;
  private _config: SectionConfig;

  @computed
  get groupIds() {
    return this.getStore().getIds();
  }

  onSortEnd = (oldIndex: number, newIndex: number) => {
    return this.handleSortEnd(oldIndex, newIndex);
  }

  constructor() {
    super(() => true, DEFAULT_TRANSFORM);
  }

  async onReceiveProps(props: SectionProps) {
    if (this._type === props.type) return;

    this._type = props.type;
    this._config = SECTION_CONFIGS[this._type];

    await this.fetchGroups();

    if (this._config.entity) {
      this.subscribeNotification(this._config.entity, () => this.fetchGroups());
    }
  }

  async fetchGroups() {
    if (this._config.queryType && this._config.entityName) {
      const groupService = GroupService.getInstance<service.GroupService>();
      const groups = await groupService.getGroupsByType(this._config.queryType);

      // TODO dont clear all
      const store = this.getStore();
      store.clearAll();

      this.handlePageData(this._config.entityName, groups, true);
    }
  }

  handleSortEnd(oldIndex: number, newIndex: number) {
    const groupService = GroupService.getInstance<service.GroupService>();
    groupService.reorderFavoriteGroups(oldIndex, newIndex);
  }
}

export default SectionViewModel;
export { SectionViewModel };
