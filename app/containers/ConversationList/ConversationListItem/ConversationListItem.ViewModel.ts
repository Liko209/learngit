/*
* @Author: Chris Zhan (chris.zhan@ringcentral.com)
* @Date: 2018-09-19 14:19:09
* Copyright © RingCentral. All rights reserved.
*/
import { observable, autorun, action } from 'mobx';
import { AbstractViewModel } from '@/base';
import {
  ConversationListItemProps,
  ConversationListItemViewProps,
} from './types';
import { service } from 'sdk';
const { GroupService } = service;
import { getEntity, getSingleEntity } from '@/store/utils';
import { getGroupName } from '@/utils/groupName';
import { ENTITY_NAME } from '@/store';
import GroupModel from '@/store/models/Group';
import _ from 'lodash';
import { MyState } from 'sdk/models';
import MyStateModel from '@/store/models/MyState';
import GroupStateModel from '@/store/models/GroupState';

class ConversationListItemViewModel extends AbstractViewModel
  implements ConversationListItemViewProps {
  @observable
  id: number;

  @observable
  currentUserId?: number;

  @observable
  currentGroupId?: number;

  @observable
  displayName: string;

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

  constructor(props: ConversationListItemProps) {
    super();
    this.id = props.id;
    this.currentUserId = props.currentUserId;
    this.currentGroupId = props.currentGroupId;
    this.displayName = '';
    this.groupService = GroupService.getInstance();

    autorun(() => {
      this.getData();
    });
  }

  getData() {
    const group = getEntity(ENTITY_NAME.GROUP, this.id) as GroupModel;
    const lastGroup = getSingleEntity<MyState, MyStateModel>(
      ENTITY_NAME.MY_STATE,
      'lastGroupId',
    ) as number;
    const groupState = getEntity(
      ENTITY_NAME.GROUP_STATE,
      this.id,
    ) as GroupStateModel;

    const currentUserId = this.currentUserId;
    const isCurrentGroup = lastGroup && lastGroup === this.id;

    this.umiHint = !!(!isCurrentGroup && groupState.unreadCount);

    this.displayName = getGroupName(getEntity, group, currentUserId);
  }

  clickGroup() {
    this.groupService.clickGroup(this.id);
  }

  @action
  private _onMenuClose() {
    this.anchorEl = null;
  }
}

export { ConversationListItemViewModel };
