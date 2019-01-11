/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-09-28 16:29:03
 * Copyright © RingCentral. All rights reserved.
 */

import { observable, computed } from 'mobx';
import { AbstractViewModel } from '@/base';
import { ProgressActionsProps, ProgressActionsViewProps } from './types';
import { NewPostService } from 'sdk/module/post';
import { ItemService } from 'sdk/module/item';
import { Post } from 'sdk/module/post/entity';
import { Progress, PROGRESS_STATUS } from 'sdk/module/progress/entity';
import { getEntity } from '@/store/utils';
import PostModel from '@/store/models/Post';
import { ENTITY_NAME } from '@/store';
import { Notification } from '@/containers/Notification';
import ProgressModel from '@/store/models/Progress';

class ProgressActionsViewModel extends AbstractViewModel<ProgressActionsProps>
  implements ProgressActionsViewProps {
  private _postService: NewPostService = NewPostService.getInstance();
  private _itemService: ItemService = ItemService.getInstance();
  private _timer: NodeJS.Timer;
  @observable
  postStatus?: PROGRESS_STATUS;

  constructor(props: ProgressActionsProps) {
    super(props);
    if (this.props.id < 0) {
      this.autorun(() => {
        if (this.postProgress === PROGRESS_STATUS.INPROGRESS) {
          clearTimeout(this._timer);
          this._timer = setTimeout(() => {
            this.postStatus = this.postProgress;
          },                       500);
        } else {
          this.postStatus = this.postProgress;
        }
      });
    }
  }

  @computed
  get id() {
    return this.props.id; // post id
  }

  @computed
  get post() {
    return getEntity<Post, PostModel>(ENTITY_NAME.POST, this.id);
  }

  @computed
  get postProgress() {
    if (this.id < 0) {
      const progress = getEntity<Progress, ProgressModel>(
        ENTITY_NAME.PROGRESS,
        this.id,
      );
      return progress.progressStatus;
    }
    return PROGRESS_STATUS.SUCCESS;
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
