/*
* @Author: Chris Zhan (chris.zhan@ringcentral.com)
* @Date: 2018-09-19 14:19:09
* Copyright © RingCentral. All rights reserved.
*/
import { computed } from 'mobx';
import { ConversationListItemViewProps } from './types';
import { service } from 'sdk';
const { GroupService } = service;
import { getEntity, getGlobalValue } from '@/store/utils';
import { ENTITY_NAME } from '@/store';
import { GLOBAL_KEYS } from '@/store/constants';
import storeManager from '@/store/base/StoreManager';
import GroupModel from '@/store/models/Group';
import _ from 'lodash';
import StoreViewModel from '@/store/ViewModel';
import history from '@/utils/history';
import { CONVERSATION_TYPES } from '@/constants';

class ConversationListItemViewModel extends StoreViewModel<
  ConversationListItemViewProps
> {
  unreadCount: number;
  important?: boolean | undefined;
  groupService: service.GroupService = GroupService.getInstance();
  draft?: string | undefined;
  sendFailurePostIds: number[];

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
    return this.selected;
  }
}

export { ConversationListItemViewModel };
