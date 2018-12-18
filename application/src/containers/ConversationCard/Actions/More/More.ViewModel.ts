/*
 * @Author: Shining (shining.miao@ringcentral.com)
 * @Date: 2018-12-06 13:29:53
 * Copyright © RingCentral. All rights reserved.
 */

import { computed } from 'mobx';
import { StoreViewModel } from '@/store/ViewModel';
import { Props, ViewProps, MENU_LIST_ITEM_TYPE } from './types';
// import { service } from 'sdk';
import { Post, Group } from 'sdk/models';
import { getGlobalValue, getEntity } from '@/store/utils';
import { GLOBAL_KEYS } from '@/store/constants';
import { ENTITY_NAME } from '@/store';
import PostModel from '@/store/models/Post';
import GroupModel from '@/store/models/Group';

// @TODO should get the permission by service
enum PERMISSION_ENUM {
  TEAM_POST,
  TEAM_ADD_MEMBER,
  TEAM_ADD_INTEGRATIONS,
  TEAM_PIN_POST,
}

class MoreViewModel extends StoreViewModel<Props> implements ViewProps {
  private _currentUserId = getGlobalValue(GLOBAL_KEYS.CURRENT_USER_ID);
  // use currentGroupId === 0 to judge is on Bookmarks/Mentions page
  private _currentGroupId = getGlobalValue(GLOBAL_KEYS.CURRENT_CONVERSATION_ID);

  @computed
  get permissionsMap() {
    return {
      [MENU_LIST_ITEM_TYPE.QUOTE]: {
        permission: this._canPost && this._excludeBookmarksOrMentionsPage,
      },
      [MENU_LIST_ITEM_TYPE.DELETE]: {
        permission: this._isPostByMe,
      },
      [MENU_LIST_ITEM_TYPE.EDIT]: {
        permission: this._canPost && this._isPostByMe,
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
  private get _isPostByMe() {
    return this._currentUserId === this._post.creatorId;
  }

  @computed
  private get _canPost() {
    if (this._group.isTeam) {
      if (!this._group.isThePersonAdmin(this._currentUserId)) {
        if (this._group.permissions && this._group.permissions.user) {
          const { level = 0 } = this._group.permissions.user;
          return !!(level & (1 << PERMISSION_ENUM.TEAM_POST));
        }
      }
      return true;
    }
    return true;
  }

  @computed
  private get _excludeBookmarksOrMentionsPage() {
    return this._currentGroupId !== 0;
  }

  @computed
  private get _isText() {
    return !!this._post.text;
  }

  @computed
  get showMoreAction() {
    return this._isText;
  }
}

export { MoreViewModel };
