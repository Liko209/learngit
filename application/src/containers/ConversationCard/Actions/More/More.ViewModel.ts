/*
 * @Author: Shining (shining.miao@ringcentral.com)
 * @Date: 2018-12-06 13:29:53
 * Copyright © RingCentral. All rights reserved.
 */

import { computed } from 'mobx';
import { StoreViewModel } from '@/store/ViewModel';
import { Props, ViewProps, MENU_LIST_ITEM_TYPE } from './types';
import { Post } from 'sdk/module/post/entity';
import { Group } from 'sdk/module/group/entity';
import { TypeDictionary } from 'sdk/utils';
import { getGlobalValue, getEntity } from '@/store/utils';
import { GLOBAL_KEYS } from '@/store/constants';
import { ENTITY_NAME } from '@/store';
import PostModel from '@/store/models/Post';
import GroupModel from '@/store/models/Group';

class MoreViewModel extends StoreViewModel<Props> implements ViewProps {
  private _currentUserId = getGlobalValue(GLOBAL_KEYS.CURRENT_USER_ID);
  // use currentGroupId === 0 to judge is on Bookmarks/Mentions page
  private _currentGroupId = getGlobalValue(GLOBAL_KEYS.CURRENT_CONVERSATION_ID);

  @computed
  get permissionsMap() {
    return {
      [MENU_LIST_ITEM_TYPE.QUOTE]: {
        permission: this._canPost && this._excludeBookmarksOrMentionsPage,
        shouldShowAction: !this._isEventOrTask,
      },
      [MENU_LIST_ITEM_TYPE.DELETE]: {
        permission: this._isPostByMe,
        shouldShowAction: !this._isEventOrTask,
      },
      [MENU_LIST_ITEM_TYPE.EDIT]: {
        permission: this._canPost && this._isPostByMe,
        shouldShowAction: !this._isEventOrTask,
      },
    };
  }

  @computed
  get id() {
    return this.props.id;
  }

  @computed
  private get _post() {
    return getEntity<Post, PostModel>(ENTITY_NAME.POST, this.id);
  }

  @computed
  private get _group() {
    return getEntity<Group, GroupModel>(ENTITY_NAME.GROUP, this._post.groupId);
  }

  @computed
  private get _isEventOrTask() {
    const { itemTypeIds } = this._post;
    return (
      itemTypeIds &&
      (!!itemTypeIds[TypeDictionary.TYPE_ID_TASK] ||
        !!itemTypeIds[TypeDictionary.TYPE_ID_EVENT])
    );
  }

  @computed
  private get _isPostByMe() {
    return this._currentUserId === this._post.creatorId;
  }

  @computed
  private get _canPost() {
    return this._group.canPost;
  }

  @computed
  private get _excludeBookmarksOrMentionsPage() {
    return this._currentGroupId !== 0;
  }

  @computed
  private get _isText() {
    const { text } = this._post;
    return !!text && text.trim().length > 0;
  }

  // @computed
  // private get _hasAttachments() {
  //   return this._post.itemIds.length > 0;
  // }

  @computed
  get showMoreAction() {
    return this._isText && !this._isEventOrTask;
  }
}

export { MoreViewModel };
