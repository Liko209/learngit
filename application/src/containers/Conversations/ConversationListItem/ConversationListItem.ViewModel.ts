/*
* @Author: Chris Zhan (chris.zhan@ringcentral.com)
* @Date: 2018-09-19 14:19:09
* Copyright © RingCentral. All rights reserved.
*/
import { MouseEvent } from 'react';
import { observable, autorun } from 'mobx';
import { AbstractViewModel } from '@/base';
import {
  ConversationListItemProps,
  ConversationListItemViewProps,
} from './types';
import { service } from 'sdk';
import showDialogWithCheckView from '../../Dialog/DialogWithCheckView';
const { GroupService } = service;
import ServiceCommonErrorType from 'sdk/service/errors/ServiceCommonErrorType';
import { getEntity } from '@/store/utils';
import { getGroupName } from '@/utils/groupName';
import { ENTITY_NAME } from '@/store';
import GroupModel from '@/store/models/Group';
import _ from 'lodash';
import PresenceModel from '../../../store/models/Presence';
import { Presence } from 'sdk/models';

class ConversationListItemViewModel extends AbstractViewModel
  implements ConversationListItemViewProps {
  @observable
  id: number;

  @observable
  currentUserId?: number;

  @observable
  group: GroupModel;

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

  groupService: service.GroupService;

  onClick = () => this.clickGroup();

  onMoreClick = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    const { currentTarget } = event;
    this.anchorEl = currentTarget;
  }

  constructor(props: ConversationListItemProps) {
    super();
    this.id = props.id;
    this.currentUserId = props.currentUserId;
    this.displayName = '';
    this.unreadCount = 0;
    this.umiVariant = 'count';
    this.status = undefined;
    this.favoriteText = this.isFavorite ? 'unFavorite' : 'favorite';
    this.groupService = GroupService.getInstance();
    autorun(() => {
      this.getData();
    });
  }

  getData() {
    this.group = getEntity(ENTITY_NAME.GROUP, this.id) as GroupModel;
    this.displayName = getGroupName(getEntity, this.group, this.currentUserId);
    this.umiVariant = this.group.isTeam ? 'auto' : 'count'; // || at_mentions
    if (this.currentUserId) {
      let targetPresencePersonId: number | undefined;
      const otherMembers = _.difference(this.group.members, [
        this.currentUserId,
      ]);
      if (otherMembers.length === 0) {
        targetPresencePersonId = this.currentUserId;
      } else if (otherMembers.length === 1) {
        targetPresencePersonId = otherMembers[0];
      }

      if (targetPresencePersonId) {
        const presence = getEntity<Presence, PresenceModel>(
          ENTITY_NAME.PRESENCE,
          targetPresencePersonId,
        );
        this.status = presence && presence.presence;
      }
    }

    this.menuOpen = !!this.anchorEl;
  }

  clickGroup() {
    this.groupService.clickGroup(this.id);
  }

  onFavoriteTogglerClick() {
    this.groupService.markGroupAsFavorite(this.id, !this.isFavorite);
    this.onMenuClose();
  }

  onMenuClose() {
    this.anchorEl = null;
  }

  onCloseClick() {
    this.onMenuClose();
    const shouldSkipCloseConfirmation = true;
    if (shouldSkipCloseConfirmation) {
      this._closeConversation(this.id, true, true);
    } else {
      showDialogWithCheckView({
        header: 'Close Conversation?',
        content:
          'Closing a conversation will remove it from the left pane, but will not delete the contents.',
        checkBoxContent: "Don't ask me again",
        okText: 'Close Conversation',
        onClose: (isChecked: boolean, event: MouseEvent<HTMLElement>) => {
          this._closeConversation(this.id, true, isChecked);
        },
      });
    }
  }

  private async _closeConversation(
    groupId: number,
    hidden: boolean,
    shouldSkipNextTime: boolean,
  ) {
    const result = await this.groupService.hideConversation(
      groupId,
      hidden,
      shouldSkipNextTime,
    );
    this._showErrorAlert(result);
  }

  private _showErrorAlert(error: ServiceCommonErrorType) {
    // if (error === ServiceCommonErrorType.NONE) {
    //   // jump to section
    //   const { history } = this.props;
    //   history.replace('/messages');
    //   return;
    // }
    // const header = 'Close Conversation Failed';
    // if (error === ServiceCommonErrorType.NETWORK_NOT_AVAILABLE) {
    //   const content =
    //     'Network disconnected. Please try again when the network is resumed.';
    //   showAlert({ header, content });
    // } else if (
    //   error === ServiceCommonErrorType.SERVER_ERROR ||
    //   error === ServiceCommonErrorType.UNKNOWN_ERROR
    // ) {
    //   const content =
    //     'We are having trouble closing the conversation. Please try again later.';
    //   showAlert({ header, content });
    // }
  }
}

export { ConversationListItemViewModel };
