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
import DocumentTitle from 'react-document-title';

import { ENTITY_NAME } from '../../store';
import injectStore, { IComponentWithGetEntityProps } from '@/store/inject';
import GroupModel from '../../store/models/Group';
import { observer } from 'mobx-react';
import { getGroupName } from '../../utils/groupName';
import { observable, computed, action, autorun } from 'mobx';
import { service } from 'sdk';
import PresenceModel from '../../store/models/Presence';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import NavPresenter from '../Home/NavPresenter';

const { GroupService } = service;
type IProps = IComponentWithGetEntityProps & RouteComponentProps<{}> & {
  id: number;
  key: number;
  entityName: string;
  isFavorite?: boolean;
  currentUserId?: number;
};

interface IState {
  title: string;
}

@observer
class ConversationListItemCell extends React.Component<IProps, IState>{
  private navPresenter: NavPresenter;
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
    this.navPresenter = new NavPresenter();

    autorun(() => {
      this.getDataFromStore();
    });
    this.state = {
      title: '',
    };
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
        const presence = getEntity(ENTITY_NAME.PRESENCE, targetPresencePersonId) as PresenceModel;
        this.status = presence && presence.presence;
      }
    }
  }
  shouldComponentUpdate(nextProps: IProps, nextState: IState) {
    if (nextProps.entityName !== this.props.entityName) {
      return true;
    }
    if (nextState.title !== this.state.title) {
      return true;
    }
    return false;
  }
  render() {
    const { title } = this.navPresenter.state;
    console.log(title);
    return (
      <div>
        <DocumentTitle title={title}>
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
        </DocumentTitle>
        <Menu
          id="render-props-menu"
          anchorEl={this.anchorEl}
          open={this.menuOpen}
          onClose={this._handleClose}
        >
          <MenuItem onClick={this._toggleFavorite}>{this.favoriteText}</MenuItem>
        </Menu>
      </div>
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
    this.navPresenter.handleRouterChange();
    this.navPresenter.handleTitle(this.displayName);
    const { title } = this.navPresenter.state;
    this.setState({
      title,
    });
  }
  @action
  private _toggleFavorite() {
    const groupService: service.GroupService = GroupService.getInstance();
    groupService.markGroupAsFavorite(this.id, !this.isFavorite);
    this._handleClose();
  }
}

export default withRouter(injectStore()(ConversationListItemCell));
export { ConversationListItemCell };
