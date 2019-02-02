/*
 * @Author: Shining (shining.miao@ringcentral.com)
 * @Date: 2019-01-09 10:01:24
 * Copyright © RingCentral. All rights reserved.
 */

import { computed, action } from 'mobx';
import { StoreViewModel } from '@/store/ViewModel';
import { PinnedListProps, PinnedListViewProps } from './types';
import { Group } from 'sdk/module/group/entity';
import GroupModel from '@/store/models/Group';
import { getEntity } from '@/store/utils';
import { ENTITY_NAME } from '@/store/constants';

class PinnedListViewModel extends StoreViewModel<PinnedListProps>
  implements PinnedListViewProps {
  constructor(props: PinnedListProps) {
    super(props);
    this.reaction(
      () => this._groupId,
      () => {
        this.forceReload();
      },
      { fireImmediately: true },
    );
  }
  @computed
  private get _groupId() {
    return this.props.groupId;
  }

  @computed
  get group() {
    return getEntity<Group, GroupModel>(ENTITY_NAME.GROUP, this._groupId);
  }

  @computed
  get totalCount() {
    return this.ids.length;
  }

  @computed
  get ids() {
    const { pinnedPostIds } = this.group;
    return pinnedPostIds || [];
  }

  @action
  forceReload = async () => {
    await this.fetchNextPageItems();
  }

  @action
  fetchNextPageItems = async () => {}
}

export { PinnedListViewModel };
