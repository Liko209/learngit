/*
* @Author: Chris Zhan (chris.zhan@ringcentral.com)
* @Date: 2018-09-19 14:19:09
* Copyright © RingCentral. All rights reserved.
*/
import { observable, action, computed } from 'mobx';
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
  anchorEl: HTMLElement | null = null;

  @observable
  umiHint: boolean;

  groupService: service.GroupService;

  onClick = () => this.clickGroup();

  onMoreClick = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    const { currentTarget } = event;
    this.anchorEl = currentTarget;
  }

  onMenuClose = () => this._onMenuClose();

  constructor() {
    super();
    this.groupService = GroupService.getInstance();
  }

  @computed
  get displayName() {
    return this._group.displayName;
  }

  @computed
  get _group() {
    return getEntity(ENTITY_NAME.GROUP, this.groupId) as GroupModel;
  }

  onReceiveProps(props: ConversationListItemProps) {
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

  clickGroup() {
    this.groupService.clickGroup(this.groupId);
  }

  @action
  private _onMenuClose() {
    this.anchorEl = null;
  }
}

export { ConversationListItemViewModel };
