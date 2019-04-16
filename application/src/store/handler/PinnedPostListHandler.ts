/*
 * @Author: Thomas Yang(thomas.yang@ringcentral.com)
 * @Date: 2019-04-02 15:43:17
 * Copyright © RingCentral. All rights reserved.
 */

import { DiscontinuousPosListHandler } from './DiscontinuousPosListHandler';
import GroupModel from '@/store/models/Group';
import _ from 'lodash';
import { getEntity } from '@/store/utils';
import { reaction, IReactionDisposer } from 'mobx';
import { Post } from 'sdk/module/post/entity';
import { PostService } from 'sdk/module/post';
import storeManager, { ENTITY_NAME } from '@/store';
import { IEntityDataProvider } from '../base/fetch/types';
import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';

class PostProvider implements IEntityDataProvider<Post> {
  async getByIds(ids: number[]) {
    const postService = ServiceLoader.getInstance<PostService>(
      ServiceConfig.POST_SERVICE,
    );
    const { posts, items } = await postService.getPostsByIds(ids);
    // set items to store.
    storeManager.dispatchUpdatedDataModels(ENTITY_NAME.ITEM, items, false);
    return posts;
  }
}
class PinnedPostListHandler extends DiscontinuousPosListHandler {
  private _reactionDisposer: IReactionDisposer;
  private _groupId: number;
  constructor(groupId: number, pinnedPostList: number[]) {
    super(pinnedPostList.filter(Number), new PostProvider());
    this._groupId = groupId;

    this._reactionDisposer = reaction(
      () => this.pinnedPostIds.length || _.toString(this.pinnedPostIds),
      () => {
        this.onSourceIdsChanged(this.pinnedPostIds.filter(Number));
      },
    );
  }

  get pinnedPostIds() {
    return this.group.pinnedPostIds;
  }

  get group() {
    return getEntity(ENTITY_NAME.GROUP, this._groupId) as GroupModel;
  }

  dispose() {
    super.dispose();
    this._reactionDisposer && this._reactionDisposer();
  }
}
export { PinnedPostListHandler };
