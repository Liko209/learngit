/*
 * @Author: dennis.jiang (dennis.jiang@ringcentral.com)
 * @Date: 2018-09-29 19:01:54
 * Copyright © RingCentral. All rights reserved.
 */
import { observable, autorun, action } from 'mobx';

import { AbstractViewModel } from '@/base';
import { getEntity, getSingleEntity } from '@/store/utils';
import { MyState, Profile } from 'sdk/models';
import MyStateModel from '@/store/models/MyState';
import { MenuProps, MenuViewProps } from './types';
import { ENTITY_NAME } from '@/store';
import GroupStateModel from '@/store/models/GroupState';
import GroupModel from '@/store/models/Group';
import ProfileModel from '@/store/models/Profile';
import { service } from 'sdk';

import _ from 'lodash';

class MenuViewModel extends AbstractViewModel implements MenuViewProps {
  @observable
  id: number;

  @observable
  anchorEl: HTMLElement | null;

  @observable
  isFavorite: boolean;

  @observable
  favoriteText: string;

  @observable
  menuOpen: boolean;

  @observable
  shouldSkipCloseConfirmation: boolean;

  @observable
  umiHint: boolean;

  closeConversation = (shouldSkipNextTime: boolean) =>
    this.hideConversation(true, shouldSkipNextTime)

  toggleFavorite = () => this._toggleFavorite();

  groupService: service.GroupService;

  constructor(props: MenuProps) {
    super();
    this.id = props.id;
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

    const isCurrentGroup = lastGroup && lastGroup === this.id;

    this.umiHint = !!(!isCurrentGroup && groupState.unreadCount);

    this.isFavorite = group.isFavorite;
    this.favoriteText = this.isFavorite ? 'unFavorite' : 'favorite';
    this.menuOpen = !!this.anchorEl;
    this.shouldSkipCloseConfirmation = getSingleEntity<Profile, ProfileModel>(
      ENTITY_NAME.PROFILE,
      'skipCloseConversationConfirmation',
    );
  }

  hideConversation(hidden: boolean, shouldSkipNextTime: boolean) {
    return this.groupService.hideConversation(
      this.id,
      hidden,
      shouldSkipNextTime,
    );
  }

  private _toggleFavorite() {
    this.groupService.markGroupAsFavorite(this.id, !this.isFavorite);
  }
}
export { MenuViewModel };
