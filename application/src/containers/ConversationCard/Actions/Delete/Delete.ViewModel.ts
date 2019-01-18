/*
 * @Author: Shining (shining.miao@ringcentral.com)
 * @Date: 2018-12-09 10:10:02
 * Copyright © RingCentral. All rights reserved.
 */

import { computed } from 'mobx';
import { ENTITY_NAME } from '@/store';
import { getEntity } from '@/store/utils';
import { StoreViewModel } from '@/store/ViewModel';
import { NewPostService } from 'sdk/module/post';
import { Post } from 'sdk/module/post/entity';
import PostModel from '@/store/models/Post';
import { Props, ViewProps } from './types';

class DeleteViewModel extends StoreViewModel<Props> implements ViewProps {
  private _postService: NewPostService;

  constructor(props: Props) {
    super(props);
    this._postService = NewPostService.getInstance();
  }

  @computed
  get id() {
    return this.props.id;
  }

  @computed
  get disabled() {
    return this.props.disabled;
  }

  @computed
  get post() {
    return getEntity<Post, PostModel>(ENTITY_NAME.POST, this.id);
  }

  deletePost = async () => {
    await this._postService.deletePost(this.id);
  }
}

export { DeleteViewModel };
