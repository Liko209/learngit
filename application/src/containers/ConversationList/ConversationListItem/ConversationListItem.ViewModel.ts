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

  onClick = () => {
    storeManager.getGlobalStore().set('currentConversationId', this.groupId);
  }
}

export { ConversationListItemViewModel };
