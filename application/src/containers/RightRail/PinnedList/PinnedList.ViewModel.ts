/*
 * @Author: Shining (shining.miao@ringcentral.com)
 * @Date: 2019-01-09 10:01:24
 * Copyright © RingCentral. All rights reserved.
 */

import { computed, observable } from 'mobx';
import { StoreViewModel } from '@/store/ViewModel';
import { PinnedListProps, PinnedListViewProps } from './types';
import { Group } from 'sdk/module/group/entity';
import GroupModel from '@/store/models/Group';
import { getEntity } from '@/store/utils';
import { ENTITY_NAME } from '@/store/constants';
// import { Post } from 'sdk/module/post/entity';
// import PostModel from '@/store/models/Post';
import { QUERY_DIRECTION } from 'sdk/dao/constants';
import { DiscontinuousPosListHandler } from '@/store/handler/DiscontinuousPosListHandler';

class PinnedListViewModel extends StoreViewModel<PinnedListProps>
  implements PinnedListViewProps {
  @observable discontinuousPosListHandler: DiscontinuousPosListHandler;
  @observable firstInit: boolean = true;

  constructor(props: PinnedListProps) {
    super(props);
    this.reaction(
      () => this._groupId,
      () => {
        this.firstInit = true;
        console.log('nello change group Id');
        this.discontinuousPosListHandler.dispose();
        this.build(this.group.pinnedPostIds || []);
        console.log('nello change group Id222');
      },
    );

    this.reaction(
      () => this.group.pinnedPostIds,
      (pinnedPostIds: number[]) => {
        this.build(pinnedPostIds);
      },
    );
  }

  build(pinnedPostIds: number[]) {
    if (!pinnedPostIds) {
      return;
    }

    if (this.firstInit) {
      console.log('nello init discount');
      this.discontinuousPosListHandler = new DiscontinuousPosListHandler(
        pinnedPostIds,
      );
      this.discontinuousPosListHandler.loadMorePosts(QUERY_DIRECTION.NEWER, 20);
      this.firstInit = false;
    } else {
      this.discontinuousPosListHandler.onSourceIdsChanged(pinnedPostIds);
    }
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
    return this.discontinuousPosListHandler
      ? this.discontinuousPosListHandler.ids
      : [];
  }
}

export { PinnedListViewModel };
