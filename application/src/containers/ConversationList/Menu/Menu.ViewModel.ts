/*
 * @Author: dennis.jiang (dennis.jiang@ringcentral.com)
 * @Date: 2018-09-29 19:01:54
 * Copyright © RingCentral. All rights reserved.
 */
import _ from 'lodash';
import { computed } from 'mobx';
import { service } from 'sdk';
import { MyState, Profile } from 'sdk/models';
import { getEntity, getSingleEntity } from '@/store/utils';
import MyStateModel from '@/store/models/MyState';
import { MenuProps, MenuViewProps } from './types';
import { ENTITY_NAME } from '@/store';
import StoreViewModel from '@/store/ViewModel';
import GroupStateModel from '@/store/models/GroupState';
import GroupModel from '@/store/models/Group';
import ProfileModel from '@/store/models/Profile';

const { GroupService } = service;

class MenuViewModel extends StoreViewModel<MenuProps> implements MenuViewProps {
  private _groupService: service.GroupService = GroupService.getInstance();

  @computed
  get groupId() {
    return this.props.groupId;
  }

  @computed
  get anchorEl() {
    return this.props.anchorEl;
  }

  @computed
  get onClose() {
    return this.props.onClose;
  }

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
}
export { MenuViewModel };
