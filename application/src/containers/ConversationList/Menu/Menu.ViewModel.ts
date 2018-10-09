/*
 * @Author: dennis.jiang (dennis.jiang@ringcentral.com)
 * @Date: 2018-09-29 19:01:54
 * Copyright © RingCentral. All rights reserved.
 */
import { MouseEvent } from 'react';
import { observable, computed } from 'mobx';
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
  private _groupService: service.GroupService = GroupService.getInstance();

  @observable
  groupId: number;

  @observable
  anchorEl: HTMLElement | null = null;

  @computed
  get open() {
    return !!this.anchorEl;
  }

  @computed
  get isFavorite() {
    return this._group.isFavorite;
  }

  @computed
  get favoriteText() {
    return this.isFavorite ? 'unFavorite' : 'favorite';
  }

  @computed
  get shouldSkipCloseConfirmation() {
    return getSingleEntity<Profile, ProfileModel>(
      ENTITY_NAME.PROFILE,
      'skipCloseConversationConfirmation',
    );
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

  @computed
  private get _group() {
    return getEntity(ENTITY_NAME.GROUP, this.groupId) as GroupModel;
  }

  toggleFavorite = () => {
    this._groupService.markGroupAsFavorite(this.groupId, !this.isFavorite);
  }

  closeConversation = (shouldSkipNextTime: boolean) => {
    return this._groupService.hideConversation(
      this.groupId,
      true,
      shouldSkipNextTime,
    );
  }

  onClose: (event: MouseEvent<HTMLElement>) => void;

  onReceiveProps(props: MenuProps) {
    if (this.groupId !== props.groupId) {
      this.groupId = props.groupId;
    }

    if (this.onClose !== props.onClose) {
      this.onClose = props.onClose;
    }

    if (this.anchorEl !== props.anchorEl) {
      this.anchorEl = props.anchorEl;
    }
  }
}
export { MenuViewModel };
