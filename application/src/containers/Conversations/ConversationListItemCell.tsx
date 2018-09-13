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
import { withRouter, RouteComponentProps } from 'react-router-dom';
import GroupStateModel from '@/store/models/GroupState';
import MyStateModel from '@/store/models/MyState';
import { MyState } from 'sdk/src/models';
const { GroupService } = service;
type IProps = IInjectedStoreProps<VM> &
  RouteComponentProps<{}> & {
    id: number;
    key: number;
    entityName: string;
    isFavorite?: boolean;
    currentUserId?: number;
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
  important: boolean;

  @observable
  status: 'default' | 'offline' | 'online' | 'away' | undefined;

  @observable
  anchorEl: HTMLElement | null = null;

  @observable
  isFavorite: boolean;

  @observable
  favoriteText: string;

  @observable
  umiHint: boolean;

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
    this.isFavorite = !!props.isFavorite;
    this.favoriteText = this.isFavorite ? 'UnFavorite' : 'Favorite';

    autorun(() => {
      this.getDataFromStore();
    });
  }

  getDataFromStore() {
    const { getEntity, getSingleEntity } = this.props;
    const group = getEntity(ENTITY_NAME.GROUP, this.id) as GroupModel;
    const lastGroup = getSingleEntity<MyState, MyStateModel>(
      ENTITY_NAME.MY_STATE,
      'lastGroupId',
    ) as number;
    const groupState = getEntity(
      ENTITY_NAME.GROUP_STATE,
      this.id,
    ) as GroupStateModel;

    const { currentUserId } = this.props;
    const isCurrentGroup = lastGroup && lastGroup === this.id;

    this.umiHint = !!(
      !isCurrentGroup &&
      (groupState.unreadCount || groupState.unreadMentionsCount)
    );
    this.unreadCount = isCurrentGroup
      ? 0
      : (!group.isTeam && (groupState.unreadCount || 0)) ||
        (groupState.unreadMentionsCount || 0);
    this.important = _.has(groupState, 'unreadMentionsCount')
      ? !!groupState.unreadMentionsCount
      : this.important;
    this.displayName = getGroupName(getEntity, group, currentUserId);
    this.umiVariant = 'count'; // || at_mentions
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

  render() {
    return (
      <React.Fragment>
        <ConversationListItem
          aria-owns={open ? 'render-props-menu' : undefined}
          aria-haspopup="true"
          key={this.id}
          title={this.displayName || ''}
          umiHint={this.umiHint}
          unreadCount={this.unreadCount}
          umiVariant={this.umiVariant}
          important={this.important}
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
          <MenuItem onClick={this._toggleFavorite}>
            {this.favoriteText}
          </MenuItem>
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
}

export default withRouter(injectStore(VM)(ConversationListItemCell));
export { ConversationListItemCell };
