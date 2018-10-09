/*
* @Author: Chris Zhan (chris.zhan@ringcentral.com)
* @Date: 2018-09-19 14:19:09
* Copyright © RingCentral. All rights reserved.
*/
import { observable, computed } from 'mobx';
import {
  ConversationListItemProps,
  ConversationListItemViewProps,
} from './types';
import { service } from 'sdk';
const { GroupService } = service;
import { getEntity, getSingleEntity } from '@/store/utils';
// import { getGroupName } from '@/utils/groupName';
import { ENTITY_NAME } from '@/store';
import GroupModel from '@/store/models/Group';
import _ from 'lodash';
import { MyState } from 'sdk/models';
import MyStateModel from '@/store/models/MyState';
import GroupStateModel from '@/store/models/GroupState';
import StoreViewModel from '@/store/ViewModel';

class ConversationListItemViewModel extends StoreViewModel
  implements ConversationListItemViewProps {
  unreadCount: number;
  important?: boolean | undefined;
  draft?: string | undefined;
  sendFailurePostIds: number[];

  @observable
  groupId: number;

  @observable
  currentUserId?: number;

  @observable
  currentGroupId?: number;

  @observable
  umiHint: boolean = false;

  @observable
  selected: boolean = false;

  @computed
  get displayName() {
    return this._group.displayName;
  }

  @computed
  get _group() {
    return getEntity(ENTITY_NAME.GROUP, this.groupId) as GroupModel;
  }

  onClick = () => {
    this.groupService.clickGroup(this.groupId);
  }

  groupService: service.GroupService;

  constructor() {
    super();
    this.groupService = GroupService.getInstance();
  }

  onReceiveProps(props: ConversationListItemProps) {
    if (this.selected !== props.selected) {
      this.selected = props.selected;
    }

    if (this.groupId !== props.groupId) {
      this.groupId = props.groupId;
      this.getData();
    }
  }

  getData() {
    const lastGroup = getSingleEntity<MyState, MyStateModel>(
      ENTITY_NAME.MY_STATE,
      'lastGroupId',
    ) as number;
    const groupState = getEntity(
      ENTITY_NAME.GROUP_STATE,
      this.groupId,
    ) as GroupStateModel;

    const isCurrentGroup = lastGroup && lastGroup === this.groupId;

    this.umiHint = !!(!isCurrentGroup && groupState.unreadCount);
  }
}

export { ConversationListItemViewModel };
