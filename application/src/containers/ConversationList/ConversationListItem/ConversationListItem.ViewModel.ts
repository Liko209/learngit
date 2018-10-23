/*
* @Author: Chris Zhan (chris.zhan@ringcentral.com)
* @Date: 2018-09-19 14:19:09
* Copyright © RingCentral. All rights reserved.
*/
import { computed } from 'mobx';
import { ConversationListItemViewProps } from './types';
import { service } from 'sdk';
const { GroupService } = service;
import { getEntity, getSingleEntity } from '@/store/utils';
// import { getGroupName } from '@/utils/groupName';
import { ENTITY_NAME } from '@/store';
import storeManager from '@/store/base/StoreManager';
import GroupModel from '@/store/models/Group';
import _ from 'lodash';
import { MyState } from 'sdk/models';
import MyStateModel from '@/store/models/MyState';
import GroupStateModel from '@/store/models/GroupState';
import StoreViewModel from '@/store/ViewModel';
import history from '@/utils/history';

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
  get isTeam() {
    return this._group.isTeam;
  }

  @computed
  get personsIdsInGroup() {
    return this._group.members;
  }

  @computed
  get personIdForPresence() {
    const membersExcludeMe = this._group.membersExcludeMe;

    if (membersExcludeMe.length > 1 || this._group.isTeam) {
      return 0;
    }

    if (
      this.personsIdsInGroup &&
      this.personsIdsInGroup.length === 1 &&
      this.personsIdsInGroup[0] === this._group.meId
    ) {
      return this.personsIdsInGroup[0];
    }

    return membersExcludeMe[0];
  }

  onClick = () => {
    storeManager.getGlobalStore().set('currentConversationId', this.groupId);
    history.push(`/messages/${this.groupId}`);
  }

  @computed
  private get _currentGroupId() {
    return storeManager.getGlobalStore().get('currentConversationId');
  }

  @computed
  get umiHint() {
    const lastGroup = getSingleEntity<MyState, MyStateModel>(
      ENTITY_NAME.MY_STATE,
      'lastGroupId',
    ) as number;
    const groupState = getEntity(
      ENTITY_NAME.GROUP_STATE,
      this.groupId,
    ) as GroupStateModel;

    const isCurrentGroup = lastGroup && lastGroup === this.groupId;

    return !!(!isCurrentGroup && groupState.unreadCount);
  }
}

export { ConversationListItemViewModel };
