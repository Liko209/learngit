/*
 * @Author: Shining (shining.miao@ringcentral.com)
 * @Date: 2018-12-09 10:10:02
 * Copyright © RingCentral. All rights reserved.
 */

import { computed } from 'mobx';
import { ENTITY_NAME } from '@/store';
import { getEntity } from '@/store/utils';
import { StoreViewModel } from '@/store/ViewModel';
import { PostService } from 'sdk/module/post';
import { Post } from 'sdk/module/post/entity';
import PostModel from '@/store/models/Post';
import { Props, ViewProps } from './types';
import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';
import { catchError } from '@/common/catchError';

class DeleteViewModel extends StoreViewModel<Props> implements ViewProps {
  private _postService: PostService;

  constructor(props: Props) {
    super(props);
    this._postService = ServiceLoader.getInstance<PostService>(
      ServiceConfig.POST_SERVICE,
    );
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

  @catchError.flash({
    server: 'message.prompt.deletePostFailedForServerIssue',
    network: 'message.prompt.deletePostFailedForNetworkIssue',
  })
  deletePost = async () => {
    await this._postService.deletePost(this.id);
  }
}

export { DeleteViewModel };
