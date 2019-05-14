/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-09-28 16:29:03
 * Copyright © RingCentral. All rights reserved.
 */

import { observable, computed } from 'mobx';
import { AbstractViewModel } from '@/base';
import { ProgressActionsProps, ProgressActionsViewProps } from './types';
import { PostService } from 'sdk/module/post';
import { ItemService } from 'sdk/module/item';
import { Post } from 'sdk/module/post/entity';
import { Progress, PROGRESS_STATUS } from 'sdk/module/progress/entity';
import { getEntity } from '@/store/utils';
import PostModel from '@/store/models/Post';
import { ENTITY_NAME } from '@/store';
import ProgressModel from '@/store/models/Progress';
import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';
import { catchError, NOTIFICATION_TYPE } from '@/common/catchError';
import { RESENT_ERROR_FILE_NO_EXISTS } from './constant';

class ProgressActionsViewModel extends AbstractViewModel<ProgressActionsProps>
  implements ProgressActionsViewProps {
  private _postService = ServiceLoader.getInstance<PostService>(
    ServiceConfig.POST_SERVICE,
  );
  private _itemService = ServiceLoader.getInstance<ItemService>(
    ServiceConfig.ITEM_SERVICE,
  );
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
          },                       200);
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

  @catchError([
    {
      condition: (error: Error) => error.message === RESENT_ERROR_FILE_NO_EXISTS,
      action: NOTIFICATION_TYPE.FLASH,
      message: 'item.prompt.fileNoLongerExists',
    },
  ])
  resend = async () => {
    const canResend = await this._itemService.canResendFailedItems(
      this.post.itemIds,
    );
    if (canResend) {
      await this._postService.reSendPost(this.id);
    } else {
      throw new Error(RESENT_ERROR_FILE_NO_EXISTS);
    }
  }

  deletePost = async () => {
    await this._postService.deletePost(this.id);
  }
}

export { ProgressActionsViewModel };
