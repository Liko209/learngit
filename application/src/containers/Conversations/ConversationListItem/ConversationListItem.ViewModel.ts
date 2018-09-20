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
import { Profile } from 'sdk/models';
import ProfileModel from '@/store/models/Profile';

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
  unreadCount: number;

  @observable
  umiVariant: 'count' | 'dot' | 'auto';

  @observable
  status: 'default' | 'offline' | 'online' | 'away' | undefined;

  @observable
  anchorEl: HTMLElement | null = null;

  @observable
  isFavorite: boolean;

  @observable
  favoriteText: string;

  @observable
  menuOpen: boolean;

  @observable
  shouldSkipCloseConfirmation: boolean;

  @observable
  draft: string | undefined;

  groupService: service.GroupService;

  onClick = () => this.clickGroup();
  onMenuClose = () => this._onMenuClose();
  closeConversation = (shouldSkipNextTime: boolean) =>
    this.hideConversation(true, shouldSkipNextTime)

  onMoreClick = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    const { currentTarget } = event;
    this.anchorEl = currentTarget;
  }

  toggleFavorite = () => this._toggleFavorite();

  constructor(props: ConversationListItemProps) {
    super();
    this.id = props.id;
    this.currentUserId = props.currentUserId;
    this.currentGroupId = props.currentGroupId;
    this.displayName = '';
    this.unreadCount = 0;
    this.umiVariant = 'count';
    this.status = undefined;
    this.isFavorite = props.isFavorite || false;
    this.favoriteText = this.isFavorite ? 'unFavorite' : 'favorite';
    this.groupService = GroupService.getInstance();
    this.draft = '';

    autorun(() => {
      this.getData();
    });
  }

  getData() {
    const group = getEntity(ENTITY_NAME.GROUP, this.id) as GroupModel;
    this.displayName = getGroupName(getEntity, group, this.currentUserId);
    this.umiVariant = group.isTeam ? 'auto' : 'count'; // || at_mentions
    this.draft = group.draft;
    // if (this.currentUserId) {
    //   let targetPresencePersonId: number | undefined;
    //   const otherMembers = _.difference(group.members, [this.currentUserId]);
    //   if (otherMembers.length === 0) {
    //     targetPresencePersonId = this.currentUserId;
    //   } else if (otherMembers.length === 1) {
    //     targetPresencePersonId = otherMembers[0];
    //   }

    //   if (targetPresencePersonId) {
    //     const presence = getEntity<Presence, PresenceModel>(
    //       ENTITY_NAME.PRESENCE,
    //       targetPresencePersonId,
    //     );
    //     this.status = presence && presence.presence;
    //   }
    // }

    this.menuOpen = !!this.anchorEl;
    this.shouldSkipCloseConfirmation = getSingleEntity<Profile, ProfileModel>(
      ENTITY_NAME.PROFILE,
      'skipCloseConversationConfirmation',
    );
  }

  clickGroup() {
    this.groupService.clickGroup(this.id);
  }

  hideConversation(hidden: boolean, shouldSkipNextTime: boolean) {
    return this.groupService.hideConversation(
      this.id,
      hidden,
      shouldSkipNextTime,
    );
  }

  @action
  private _onMenuClose() {
    this.anchorEl = null;
  }

  private _toggleFavorite() {
    this.groupService.markGroupAsFavorite(this.id, !this.isFavorite);
    this._onMenuClose();
  }
}

export { ConversationListItemViewModel };
