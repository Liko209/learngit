/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-09-28 16:29:03
 * Copyright © RingCentral. All rights reserved.
 */

import { observable, computed } from 'mobx';
import { AbstractViewModel } from '@/base';
import { ProgressActionsProps, ProgressActionsViewProps } from './types';
import { PostService } from 'sdk/service';
import { Post } from 'sdk/models';
import { getEntity } from '@/store/utils';
import PostModel from '@/store/models/Post';
import { ENTITY_NAME } from '@/store';

class ProgressActionsViewModel extends AbstractViewModel
  implements ProgressActionsViewProps {
  @observable
  id: number;
  private _postService: PostService = PostService.getInstance();

  onReceiveProps({ id }: ProgressActionsProps) {
    if (id !== this.id) {
      this.id = id;
    }
  }

  @computed
  get post() {
    return getEntity<Post, PostModel>(ENTITY_NAME.POST, this.id);
  }

  resend = async () => {
    await this._postService.reSendPost(this.id);
  }

  deletePost = async () => {
    await this._postService.deletePost(this.id);
  }
}

export { ProgressActionsViewModel };
