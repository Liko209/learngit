/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-09-28 16:29:03
 * Copyright © RingCentral. All rights reserved.
 */

import { observable, computed, action } from 'mobx';
import { AbstractViewModel } from '@/base';
import { ProgressActionsProps, ProgressActionsViewProps } from './types';
import { PostService } from 'sdk/module/post';
import { ItemService } from 'sdk/module/item';
import { Post } from 'sdk/module/post/entity';
import { Progress, PROGRESS_STATUS } from 'sdk/module/progress/entity';
import { getEntity } from '@/store/utils';
import PostModel from '@/store/models/Post';
import storeManager, { ENTITY_NAME } from '@/store';
import ProgressModel from '@/store/models/Progress';
import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';
import { catchError, NOTIFICATION_TYPE } from '@/common/catchError';
import { RESENT_ERROR_FILE_NO_EXISTS } from './constant';
import { GLOBAL_KEYS } from '@/store/constants';
import { IMessageService } from '@/modules/message/interface';
import { TypeDictionary } from 'sdk/utils';
import { debounce } from 'lodash';

const DEBOUNCE_DELAY = 300;
class ProgressActionsViewModel extends AbstractViewModel<ProgressActionsProps>
  implements ProgressActionsViewProps {
  @IMessageService private _messageService: IMessageService;
  private _postService = ServiceLoader.getInstance<PostService>(
    ServiceConfig.POST_SERVICE,
  );
  private _itemService = ServiceLoader.getInstance<ItemService>(
    ServiceConfig.ITEM_SERVICE,
  );
  private _timer: NodeJS.Timer;
  private _editProcessTimer: NodeJS.Timer;
  @observable
  postStatus?: PROGRESS_STATUS;
  @observable
  inEditProcess: boolean = false;

  constructor(props: ProgressActionsProps) {
    super(props);
    if (props.id < 0) {
      this.autorun(() => {
        if (this.postProgress === PROGRESS_STATUS.INPROGRESS) {
          clearTimeout(this._timer);
          this._timer = setTimeout(() => {
            this.postStatus = this.postProgress;
          }, 200);
        } else {
          this.postStatus = this.postProgress;
        }
        if (this.isEditMode) {
          this.inEditProcess = true;
        } else {
          clearTimeout(this._editProcessTimer);
          this._editProcessTimer = setTimeout(() => {
            this.inEditProcess = false;
          }, 200);
        }
      });
    }
  }

  @computed
  get id() {
    return this.props.id; // post id
  }

  @computed
  get isEditMode() {
    return this.props.isEditMode;
  }

  @computed
  get post() {
    return getEntity<Post, PostModel>(ENTITY_NAME.POST, this.id);
  }

  @computed
  private get _isText() {
    const { text } = this.post;
    return !!text && text.trim().length > 0;
  }

  @computed
  private get _isEventOrTask() {
    const { itemTypeIds } = this.post;
    return (
      itemTypeIds &&
      (!!itemTypeIds[TypeDictionary.TYPE_ID_TASK] ||
        !!itemTypeIds[TypeDictionary.TYPE_ID_EVENT])
    );
  }

  @computed
  get showEditAction() {
    return this._isText && !this._isEventOrTask;
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
      condition: (error: Error) =>
        error.message === RESENT_ERROR_FILE_NO_EXISTS,
      action: NOTIFICATION_TYPE.FLASH,
      message: 'item.prompt.fileNoLongerExists',
    },
  ])
  resend = debounce(
    async () => {
      const canResend = await this._itemService.canResendFailedItems(
        this.post.itemIds,
      );
      if (canResend) {
        await this._postService.reSendPost(this.id);
      } else {
        throw new Error(RESENT_ERROR_FILE_NO_EXISTS);
      }
    },
    DEBOUNCE_DELAY,
    { leading: true, trailing: false },
  );

  @action
  edit = () => {
    const globalStore = storeManager.getGlobalStore();
    const inEditModePostIds = globalStore.get(
      GLOBAL_KEYS.IN_EDIT_MODE_POST_IDS,
    );
    inEditModePostIds.push(this.id);
    globalStore.set(GLOBAL_KEYS.IN_EDIT_MODE_POST_IDS, [...inEditModePostIds]);
    this._messageService.setEditInputFocus(this.id);
  };

  deletePost = debounce(
    async () => {
      await this._postService.deletePost(this.id);
    },
    DEBOUNCE_DELAY,
    { leading: true, trailing: false },
  );
}

export { ProgressActionsViewModel };
