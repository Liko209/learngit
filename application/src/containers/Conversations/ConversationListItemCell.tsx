/*
 * @Author: Lip Wang (lip.wangn@ringcentral.com)
 * @Date: 2018-08-17 14:44:46
 * Copyright © RingCentral. All rights reserved.
 */

import React from 'react';
import _ from 'lodash';
import { ConversationListItem } from 'ui-components/molecules/ConversationList/ConversationListItem';
import { Menu } from 'ui-components/atoms/Menu';
import { MenuItem } from 'ui-components/atoms/MenuItem';

import { ENTITY_NAME } from '../../store';
import injectStore, { IInjectedStoreProps } from '@/store/inject';
import VM from '@/store/ViewModel';
import GroupModel from '../../store/models/Group';
import { observer } from 'mobx-react';
import { getGroupName } from '../../utils/groupName';
import { observable, computed, action, autorun } from 'mobx';
import { service } from 'sdk';
import PresenceModel from '../../store/models/Presence';
import showAlert from '../Dialog/ShowAlert';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import ServiceCommonErrorType from 'sdk/service/errors/ServiceCommonErrorType';

const { GroupService } = service;
type IProps = IInjectedStoreProps<VM> &
  RouteComponentProps<{}> & {
    id: number;
    key: number;
    entityName: string;
    isFavorite?: boolean;
    currentUserId?: number;
    shouldSkipCloseConfirmation?: boolean;
  };

interface IState {}

@observer
class ConversationListItemCell extends React.Component<IProps, IState> {
  static defaultProps = {
    isFavorite: false,
  };

  @observable
  id: number;

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
  shouldSkipCloseConfirmation: boolean;

  closeText: string;

  @computed
  get menuOpen() {
    return !!this.anchorEl;
  }

  constructor(props: IProps) {
    super(props);
    this.id = props.id;
    this.displayName = '';
    this.unreadCount = 0;
    this.umiVariant = 'count';
    this.status = undefined;
    this._openMenu = this._openMenu.bind(this);
    this._toggleFavorite = this._toggleFavorite.bind(this);
    this._handleClose = this._handleClose.bind(this);
    this._onClick = this._onClick.bind(this);
    this._toggleCloseConversation = this._toggleCloseConversation.bind(this);
    this.isFavorite = !!props.isFavorite;
    this.favoriteText = this.isFavorite ? 'UnFavorite' : 'Favorite';
    this.shouldSkipCloseConfirmation = !!props.shouldSkipCloseConfirmation;
    this.closeText = 'Close';

    autorun(() => {
      this.getDataFromStore();
    });
  }

  getDataFromStore() {
    const { getEntity } = this.props;
    const group = getEntity(ENTITY_NAME.GROUP, this.id) as GroupModel;
    const { currentUserId } = this.props;
    this.displayName = getGroupName(getEntity, group, currentUserId);
    this.umiVariant = group.isTeam ? 'auto' : 'count'; // || at_mentions
    if (currentUserId) {
      let targetPresencePersonId: number | undefined;
      const otherMembers = _.difference(group.members, [currentUserId]);
      if (otherMembers.length === 0) {
        targetPresencePersonId = currentUserId;
      } else if (otherMembers.length === 1) {
        targetPresencePersonId = otherMembers[0];
      }

      if (targetPresencePersonId) {
        const presence = getEntity(
          ENTITY_NAME.PRESENCE,
          targetPresencePersonId,
        ) as PresenceModel;
        this.status = presence && presence.presence;
      }
    }
  }

  renderCloseMenuItem() {
    if (!this.isFavorite && this.unreadCount === 0) {
      return (
        <MenuItem onClick={this._toggleCloseConversation}>
          {this.closeText}
        </MenuItem>
      );
    }
    return <React.Fragment />;
  }

  renderMenu() {
    return (
      <Menu
        id="render-props-menu"
        anchorEl={this.anchorEl}
        open={this.menuOpen}
        onClose={this._handleClose}
      >
        <MenuItem onClick={this._toggleFavorite}>{this.favoriteText}</MenuItem>
        {this.renderCloseMenuItem()}
      </Menu>
    );
  }

  render() {
    return (
      <React.Fragment>
        <ConversationListItem
          aria-owns={open ? 'render-props-menu' : undefined}
          aria-haspopup="true"
          key={this.id}
          title={this.displayName || ''}
          unreadCount={this.unreadCount}
          umiVariant={this.umiVariant}
          onMoreClick={this._openMenu}
          onClick={this._onClick}
          status={this.status}
        />
        {this.renderMenu()}
      </React.Fragment>
    );
  }

  @action
  private _openMenu(event: React.MouseEvent<HTMLElement>) {
    const { currentTarget } = event;
    this.anchorEl = currentTarget;
  }

  @action
  private _handleClose() {
    this.anchorEl = null;
  }

  @action
  private _onClick() {
    const groupService: service.GroupService = GroupService.getInstance();
    groupService.clickGroup(this.id);
    this._jump2Conversation(this.id);
  }
  private _jump2Conversation(id: number) {
    const { history } = this.props;
    history.push(`/messages/${id}`);
  }
  @action
  private _toggleFavorite() {
    const groupService: service.GroupService = GroupService.getInstance();
    groupService.markGroupAsFavorite(this.id, !this.isFavorite);
    this._handleClose();
  }
  @action
  private async _toggleCloseConversation() {
    // if (this.shouldSkipCloseConfirmation) {
    // } else {
    //   // show confirm
    // }
    this._handleClose();
    const groupService: service.GroupService = GroupService.getInstance();
    const result = await groupService.hideConversation(this.id, true, false);
    this._showErrorAlert(result);
  }
  private _showErrorAlert(error: ServiceCommonErrorType) {
    const header = 'Close Conversation Failed';
    if (error === ServiceCommonErrorType.NETWORK_NOT_AVAILABLE) {
      const content =
        'Network disconnected. Please try again when the network is resumed.';
      showAlert({ header, content });
    } else if (
      error === ServiceCommonErrorType.SERVER_ERROR ||
      error === ServiceCommonErrorType.UNKNOWN_ERROR
    ) {
      const content =
        'We are having trouble closing the conversation. Please try again later.';
      showAlert({ header, content });
    }
    if (error === ServiceCommonErrorType.NONE) {
      // jump to section
    }
  }
}

export default withRouter(injectStore(VM)(ConversationListItemCell));
export { ConversationListItemCell };
