/*
 * @Author: dennis.jiang (dennis.jiang@ringcentral.com)
 * @Date: 2018-09-29 19:01:54
 * Copyright © RingCentral. All rights reserved.
 */
import { MouseEvent } from 'react';
import { observable } from 'mobx';
import _ from 'lodash';
import { service } from 'sdk';
import { MyState, Profile } from 'sdk/models';
import { getEntity, getSingleEntity } from '@/store/utils';
import MyStateModel from '@/store/models/MyState';
/*
 * @Author: dennis.jiang (dennis.jiang@ringcentral.com)
 * @Date: 2018-09-29 18:56:22
 * Copyright © RingCentral. All rights reserved.
 */
import { MenuProps, MenuViewProps } from './types';
import { ENTITY_NAME } from '@/store';
import StoreViewModel from '@/store/ViewModel';
import GroupStateModel from '@/store/models/GroupState';
import GroupModel from '@/store/models/Group';
import ProfileModel from '@/store/models/Profile';

const { GroupService } = service;

class MenuViewModel extends StoreViewModel implements MenuViewProps {
  @observable
  groupId: number;

  @observable
  anchorEl: HTMLElement | null;

  @observable
  isFavorite: boolean;

  @observable
  favoriteText: string;

  @observable
  open: boolean;

  @observable
  onClose: (event: MouseEvent<HTMLElement>) => void;

  @observable
  shouldSkipCloseConfirmation: boolean;

  @observable
  umiHint: boolean;

  toggleFavorite = () => {
    this.groupService.markGroupAsFavorite(this.groupId, !this.isFavorite);
  }

  closeConversation = (shouldSkipNextTime: boolean) => {
    return this.groupService.hideConversation(
      this.groupId,
      true,
      shouldSkipNextTime,
    );
  }

  groupService: service.GroupService;
  constructor() {
    super();
    this.groupService = GroupService.getInstance();
  }

  onReceiveProps(props: MenuProps) {
    if (this.groupId !== props.groupId) {
      this.groupId = props.groupId;
      this.getData();
    }

    if (this.open !== props.open) {
      this.open = props.open;
    }

    if (this.onClose !== props.onMenuClose) {
      this.onClose = props.onMenuClose;
    }

    if (this.anchorEl !== props.anchorEl) {
      this.anchorEl = props.anchorEl;
    }
  }

  getData() {
    const group = getEntity(ENTITY_NAME.GROUP, this.groupId) as GroupModel;
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

    this.isFavorite = group.isFavorite;
    this.favoriteText = this.isFavorite ? 'unFavorite' : 'favorite';
    this.shouldSkipCloseConfirmation = getSingleEntity<Profile, ProfileModel>(
      ENTITY_NAME.PROFILE,
      'skipCloseConversationConfirmation',
    );
  }
}
export { MenuViewModel };
