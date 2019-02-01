/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2018-08-22 15:21:30
 * Copyright © RingCentral. All rights reserved.
 */
import { computed, observable, action } from 'mobx';
import { GroupService } from 'sdk/module/group';
import _ from 'lodash';
import StoreViewModel from '@/store/ViewModel';
import SectionGroupHandler from '@/store/handler/SectionGroupHandler';
import {
  SectionProps,
  SectionConfigs,
  SectionViewProps,
  SECTION_TYPE,
} from './types';
import { GLOBAL_KEYS } from '@/store/constants';
import { getGlobalValue } from '@/store/utils';
import { QUERY_DIRECTION } from 'sdk/dao';

const SECTION_CONFIGS: SectionConfigs = {
  [SECTION_TYPE.FAVORITE]: {
    title: 'favorite_plural',
    iconName: 'star_border',
    sortable: true,
  },
  [SECTION_TYPE.DIRECT_MESSAGE]: {
    title: 'directMessage_plural',
    iconName: 'direct_message',
  },
  [SECTION_TYPE.TEAM]: {
    title: 'team_plural',
    iconName: 'team',
  },
};

class SectionViewModel extends StoreViewModel<SectionProps>
  implements SectionViewProps {
  @observable
  isLast: boolean;

  private _type: SECTION_TYPE;

  private _sortable?: boolean;

  @observable
  expanded: boolean = true;

  title: string;
  iconName: string;

  constructor(props: SectionProps) {
    super(props);
    const { type, isLast } = props;
    const { iconName, title, sortable } = SECTION_CONFIGS[type];
    this.isLast = isLast;
    this.iconName = iconName;
    this.title = title;
    this._type = type;
    this._sortable = sortable;
  }

  @computed
  get sortable() {
    const unreadToggleOn = getGlobalValue(GLOBAL_KEYS.UNREAD_TOGGLE_ON);
    return !unreadToggleOn && !!this._sortable;
  }

  @computed
  get groupIds() {
    return SectionGroupHandler.getInstance().getGroupIdsByType(this._type);
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

  @action
  async fetchGroups() {
    await SectionGroupHandler.getInstance().fetchGroups(
      this._type,
      QUERY_DIRECTION.NEWER,
    );
  }

  handleSortEnd(oldIndex: number, newIndex: number) {
    const groupService = GroupService.getInstance<GroupService>();
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
