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

import storeManager, { ENTITY_NAME } from '../../store';
import MultiEntityMapStore from '../../store/base/MultiEntityMapStore';
import GroupModel from '../../store/models/Group';
import { observer } from 'mobx-react';
import { getGroupName } from '../../utils/groupName';
import { observable, computed, action, autorun } from 'mobx';
import { service } from 'sdk';
import { Group, Presence } from 'sdk/models';
import PresenceModel from '../../store/models/Presence';
import { withRouter, RouteComponentProps } from 'react-router';
const { GroupService } = service;
interface IProps extends RouteComponentProps<any> {
  id: number;
  key: number;
  entityName: string;
  isFavorite?: boolean;
  currentUserId?: number;
}

interface IState {
}

@observer
class ConversationListItemCell extends React.Component<IProps, IState>{
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

  @computed
  get menuOpen() {
    return !!this.anchorEl;
  }

  groupStore: MultiEntityMapStore<Group, GroupModel>;
  presenceStore: MultiEntityMapStore<Presence, PresenceModel>;

  constructor(props: IProps) {
    super(props);
    this.id = props.id;
    this.displayName = '';
    this.unreadCount = 0;
    this.umiVariant = 'count';
    this.status = undefined;
    this.groupStore = storeManager.getEntityMapStore(props.entityName) as MultiEntityMapStore<Group, GroupModel>;
    this.presenceStore = storeManager.getEntityMapStore(ENTITY_NAME.PRESENCE) as MultiEntityMapStore<Presence, PresenceModel>;
    this._openMenu = this._openMenu.bind(this);
    this._toggleFavorite = this._toggleFavorite.bind(this);
    this._handleClose = this._handleClose.bind(this);
    this._onClick = this._onClick.bind(this);
    this.isFavorite = !!props.isFavorite;
    this.favoriteText = this.isFavorite ? 'UnFavorite' : 'Favorite';

    autorun(() => {
      this.getDataFromStore();
    });
  }

  getDataFromStore() {
    const group = this.groupStore.get(this.id);
    const { currentUserId } = this.props;
    this.displayName = getGroupName(group, currentUserId);
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
        this.status = this.presenceStore.get(targetPresencePersonId) && this.presenceStore.get(targetPresencePersonId).presence;
      }
    }
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
        <Menu
          id="render-props-menu"
          anchorEl={this.anchorEl}
          open={this.menuOpen}
          onClose={this._handleClose}
        >
          <MenuItem onClick={this._toggleFavorite}>{this.favoriteText}</MenuItem>
        </Menu>
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
  private _jump2Conversation(id:number) {
    const { history } = this.props;
    history.push(`/messages/${id}`);
  }
  @action
  private _toggleFavorite() {
    console.log('_toggleFavorite()');
    const groupService: service.GroupService = GroupService.getInstance();
    groupService.markGroupAsFavorite(this.id, !this.isFavorite);

    this._handleClose();
  }
}

export default withRouter(ConversationListItemCell);
