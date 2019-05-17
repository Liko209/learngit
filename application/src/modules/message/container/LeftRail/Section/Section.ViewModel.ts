/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2018-08-22 15:21:30
 * Copyright © RingCentral. All rights reserved.
 */
import { computed, observable, action } from 'mobx';
import { ProfileService } from 'sdk/module/profile';
import _ from 'lodash';
import StoreViewModel from '@/store/ViewModel';
import SectionGroupHandler from '@/store/handler/SectionGroupHandler';
import { SectionProps, SectionConfigs, SECTION_TYPE } from './types';
import { GLOBAL_KEYS } from '@/store/constants';
import { getGlobalValue } from '@/store/utils';
import { QUERY_DIRECTION } from 'sdk/dao';
import { mainLogger } from 'sdk';
import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';

const SECTION_CONFIGS: SectionConfigs = {
  [SECTION_TYPE.FAVORITE]: {
    title: 'message.favoriteGroups',
    iconName: 'star',
    sortable: true,
  },
  [SECTION_TYPE.DIRECT_MESSAGE]: {
    title: 'message.directGroups',
    iconName: 'direct_message',
  },
  [SECTION_TYPE.TEAM]: {
    title: 'message.teamGroups',
    iconName: 'team',
  },
};

class SectionViewModel extends StoreViewModel<SectionProps> {
  @observable
  expanded: boolean = true;

  @observable
  private _groupIDs: number[] = [];

  constructor(props: SectionProps) {
    super(props);
    this.autorun(() => {
      const ids = SectionGroupHandler.getInstance().getGroupIdsByType(
        this.props.type,
      );
      this._groupIDs = [...ids];
    });
  }

  @computed
  get _config() {
    return SECTION_CONFIGS[this.props.type];
  }

  @computed
  get sortable() {
    const unreadToggleOn = getGlobalValue(GLOBAL_KEYS.UNREAD_TOGGLE_ON);
    return !unreadToggleOn && !!this._config.sortable;
  }

  @computed
  get groupIds() {
    return this._groupIDs;
  }

  @computed
  get iconName() {
    return this._config.iconName;
  }

  @computed
  get title() {
    return this._config.title;
  }

  onSortEnd = ({
    oldIndex,
    newIndex,
  }: {
    oldIndex: number;
    newIndex: number;
  }) => {
    this.handleSortEnd(oldIndex, newIndex);
  }

  @action
  async fetchGroups() {
    await SectionGroupHandler.getInstance().fetchGroups(
      this.props.type,
      QUERY_DIRECTION.NEWER,
    );
  }

  private _reorder = (oldIndex: number, newIndex: number) => {
    const newOrder = _.cloneDeep(this._groupIDs);
    const id = newOrder[oldIndex];
    if (oldIndex > newIndex) {
      for (let i = oldIndex; i > newIndex; i -= 1) {
        newOrder[i] = newOrder[i - 1];
      }
    } else {
      for (let i = oldIndex; i < newIndex; i += 1) {
        newOrder[i] = newOrder[i + 1];
      }
    }
    newOrder[newIndex] = id;
    return newOrder;
  }

  @action
  handleSortEnd = async (oldIndex: number, newIndex: number) => {
    const oldIds = [...this._groupIDs];
    this._groupIDs = this._reorder(oldIndex, newIndex);

    const profileService = ServiceLoader.getInstance<ProfileService>(
      ServiceConfig.PROFILE_SERVICE,
    );
    try {
      await profileService.reorderFavoriteGroups(oldIds, oldIndex, newIndex);
    } catch (error) {
      mainLogger
        .tags('Section.ViewModel')
        .info('reorderFavoriteGroups fail:', error);
    }
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
