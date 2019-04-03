/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2018-09-19 14:19:09
 * Copyright © RingCentral. All rights reserved.
 */
import { computed, untracked } from 'mobx';
import { ConversationListItemViewProps } from './types';
import { GroupService } from 'sdk/module/group';
import { getEntity, getGlobalValue } from '@/store/utils';
import { ENTITY_NAME } from '@/store';
import { GLOBAL_KEYS } from '@/store/constants';
import storeManager from '@/store/base/StoreManager';
import GroupModel from '@/store/models/Group';
import StoreViewModel from '@/store/ViewModel';
import history from '@/history';
import { CONVERSATION_TYPES } from '@/constants';

class ConversationListItemViewModel extends StoreViewModel<
  ConversationListItemViewProps
> {
  firstUnreadCount: number;
  important?: boolean | undefined;
  groupService: GroupService = GroupService.getInstance();
  hasShowedUmi: boolean = false;

  @computed
  get groupId() {
    return this.props.groupId;
  }

  @computed
  get selected() {
    return this._currentGroupId === this.groupId;
  }

  @computed
  get displayName() {
    return this._group.displayName;
  }

  @computed
  get _group() {
    return getEntity(ENTITY_NAME.GROUP, this.groupId) as GroupModel;
  }

  @computed
  get groupType() {
    return this._group.type;
  }

  @computed
  get personId() {
    const currentUserId = getGlobalValue(GLOBAL_KEYS.CURRENT_USER_ID);
    const membersExcludeMe = this._group.membersExcludeMe;
    switch (this.groupType) {
      case CONVERSATION_TYPES.TEAM:
      case CONVERSATION_TYPES.NORMAL_GROUP:
        return 0;
      case CONVERSATION_TYPES.ME:
        return currentUserId;
      default:
        return membersExcludeMe[0];
    }
  }

  onClick = () => {
    history.push(`/messages/${this.groupId}`);
  }

  @computed
  private get _currentGroupId() {
    return storeManager
      .getGlobalStore()
      .get(GLOBAL_KEYS.CURRENT_CONVERSATION_ID);
  }

  @computed
  get umiHint() {
    const groupState = getEntity(ENTITY_NAME.GROUP_STATE, this.groupId);
    let hint = !!groupState.unreadCount;
    untracked(() => {
      const currentGroupId = getGlobalValue(
        GLOBAL_KEYS.CURRENT_CONVERSATION_ID,
      );
      if (this.groupId === currentGroupId) {
        hint = getGlobalValue(GLOBAL_KEYS.SHOULD_SHOW_UMI) && hint;
      }
    });
    return hint;
  }

  @computed
  get hidden() {
    return (
      storeManager.getGlobalStore().get(GLOBAL_KEYS.UNREAD_TOGGLE_ON) &&
      !(this.umiHint || this.selected)
    );
  }
}

export { ConversationListItemViewModel };
