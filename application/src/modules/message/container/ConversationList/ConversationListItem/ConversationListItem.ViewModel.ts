/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2018-09-19 14:19:09
 * Copyright © RingCentral. All rights reserved.
 */
import { computed } from 'mobx';
import { ConversationListItemViewProps } from './types';
import { GroupService } from 'sdk/module/group';
import { getEntity, getGlobalValue } from '@/store/utils';
import { ENTITY_NAME } from '@/store';
import { GLOBAL_KEYS } from '@/store/constants';
import storeManager from '@/store/base/StoreManager';
import GroupModel from '@/store/models/Group';
import { GroupState } from 'sdk/module/state/entity';
import GroupStateModel from '@/store/models/GroupState';
import StoreViewModel from '@/store/ViewModel';
import history from '@/history';
import { CONVERSATION_TYPES } from '@/constants';
import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';

class ConversationListItemViewModel extends StoreViewModel<
  ConversationListItemViewProps
  > {
  firstUnreadCount: number;
  important?: boolean | undefined;
  groupService: GroupService = ServiceLoader.getInstance<GroupService>(
    ServiceConfig.GROUP_SERVICE,
  );
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
    storeManager
      .getGlobalStore()
      .set(GLOBAL_KEYS.CURRENT_CONVERSATION_ID, this.groupId);
    setTimeout(() => history.push(`/messages/${this.groupId}`), 0);
    this.groupService.onGroupClick(this.groupId);
  };

  @computed
  private get _currentGroupId() {
    return storeManager
      .getGlobalStore()
      .get(GLOBAL_KEYS.CURRENT_CONVERSATION_ID);
  }

  @computed
  private get _groupState() {
    return getEntity<GroupState, GroupStateModel>(
      ENTITY_NAME.GROUP_STATE,
      this.groupId,
    );
  }

  @computed
  get umiHint() {
    return !!this._groupState.unreadCount;
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
