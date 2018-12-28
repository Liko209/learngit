/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-09-28 16:29:03
 * Copyright © RingCentral. All rights reserved.
 */

import { observable, computed } from 'mobx';
import { AbstractViewModel } from '@/base';
import { ProgressActionsProps, ProgressActionsViewProps } from './types';
import { PostService, ItemService, POST_STATUS } from 'sdk/service';
import { Post } from 'sdk/models';
import { getEntity } from '@/store/utils';
import PostModel from '@/store/models/Post';
import { ENTITY_NAME } from '@/store';
import { Notification } from '@/containers/Notification';

class ProgressActionsViewModel extends AbstractViewModel<ProgressActionsProps>
  implements ProgressActionsViewProps {
  private _postService: PostService = PostService.getInstance();
  private _itemService: ItemService = ItemService.getInstance();
  private _timer: NodeJS.Timer;
  @observable
  postStatus?: POST_STATUS;

  constructor(props: ProgressActionsProps) {
    super(props);
    this.autorun(() => {
      if (this.post.status === POST_STATUS.INPROGRESS) {
        clearTimeout(this._timer);
        this._timer = setTimeout(() => {
          this.postStatus = this.post.status;
        },                       500);
      } else {
        this.postStatus = this.post.status;
      }
    });
  }

  @computed
  get id() {
    return this.props.id; // post id
  }

  @computed
  get post() {
    return getEntity<Post, PostModel>(ENTITY_NAME.POST, this.id);
  }

  resend = async () => {
    const canResend = await this._itemService.canResendFailedItems(
      this.post.itemIds,
    );
    if (canResend) {
      await this._postService.reSendPost(this.id);
    } else {
      Notification.flashToast({
        message: 'fileNoLongerExists',
        type: 'error',
        messageAlign: 'left',
        fullWidth: false,
        dismissible: false,
      });
    }
  }

  deletePost = async () => {
    await this._postService.deletePost(this.id);
  }
}

export { ProgressActionsViewModel };
