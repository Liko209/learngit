/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2018-08-22 15:21:30
 * Copyright © RingCentral. All rights reserved.
 */
import { computed, observable, action } from 'mobx';
import { service } from 'sdk';
import { GROUP_QUERY_TYPE, ENTITY } from 'sdk/service';
import { Group } from 'sdk/module/group/entity';
import { ENTITY_NAME } from '@/store';
import _ from 'lodash';
import StoreViewModel from '@/store/ViewModel';
import { ISortableModel } from '@/store/base/fetch';
import SectionGroupHandler from '@/store/handler/SectionGroupHandler';
import {
  SectionProps,
  SectionConfig,
  SectionConfigs,
  SectionViewProps,
  SECTION_TYPE,
} from './types';
import { GLOBAL_KEYS } from '@/store/constants';
import { getGlobalValue } from '@/store/utils';
import { QUERY_DIRECTION } from 'sdk/dao';
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
    iconName: 'star_border',
    eventName: ENTITY.FAVORITE_GROUPS,
    entityName: ENTITY_NAME.GROUP,
    queryType: GROUP_QUERY_TYPE.FAVORITE,
    globalKey: GLOBAL_KEYS.GROUP_QUERY_TYPE_FAVORITE_IDS,
    transformFun: favGroupTransformFunc,
    sortable: true,
    isMatchFun: (model: Group) => {
      return true;
    },
  },
  [SECTION_TYPE.DIRECT_MESSAGE]: {
    title: 'directMessage_plural',
    iconName: 'person_outline',
    eventName: ENTITY.PEOPLE_GROUPS,
    entityName: ENTITY_NAME.GROUP,
    queryType: GROUP_QUERY_TYPE.GROUP,
    globalKey: GLOBAL_KEYS.GROUP_QUERY_TYPE_GROUP_IDS,
    transformFun: groupTransformFunc,
    isMatchFun: (model: Group) => {
      return !model.is_team;
    },
  },
  [SECTION_TYPE.TEAM]: {
    title: 'team_plural',
    iconName: 'people_outline',
    eventName: ENTITY.TEAM_GROUPS,
    entityName: ENTITY_NAME.GROUP,
    queryType: GROUP_QUERY_TYPE.TEAM,
    globalKey: GLOBAL_KEYS.GROUP_QUERY_TYPE_TEAM_IDS,
    transformFun: groupTransformFunc,
    isMatchFun: (model: Group) => {
      return model.is_team || false;
    },
  },
};

class SectionViewModel extends StoreViewModel<SectionProps>
  implements SectionViewProps {
  constructor(props?: SectionProps) {
    super(props);
  }

  @observable
  isLast: boolean;

  @observable
  private _type: SECTION_TYPE;

  @observable
  private _config: SectionConfig;

  @observable
  expanded: boolean = true;

  @computed
  get sortable() {
    const unreadToggleOn = getGlobalValue(GLOBAL_KEYS.UNREAD_TOGGLE_ON);
    return !unreadToggleOn && !!this._config.sortable;
  }

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
    return SectionGroupHandler.getInstance().getGroupIds(this._type);
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
    if (this._type !== props.type) {
      this._type = props.type;
      this._config = SECTION_CONFIGS[this._type];
    }

    if (this.isLast !== props.isLast) {
      this.isLast = props.isLast;
    }
  }

  @action
  async fetchGroups() {
    await SectionGroupHandler.getInstance().fetchGroups(
      this._type,
      QUERY_DIRECTION.NEWER,
    );
  }

  handleSortEnd(oldIndex: number, newIndex: number) {
    const groupService = GroupService.getInstance<service.GroupService>();
    groupService.reorderFavoriteGroups(oldIndex, newIndex);
  }

  @action
  handleCollapse = () => {
    this.expanded = false;
  }

  @action
  handleExpand = () => {
    this.expanded = true;
  }
}

export default SectionViewModel;
export { SectionViewModel };
