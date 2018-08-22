/*
 * @Author: Lip Wang (lip.wangn@ringcentral.com)
 * @Date: 2018-08-17 14:44:46
 * Copyright © RingCentral. All rights reserved.
 */

import React from 'react';
import {
  Menu,
  MenuItem,
  ConversationListItem,
} from 'ui-components';
import storeManager from '@/store';
import MultiEntityMapStore from '@/store/base/MultiEntityMapStore';
import GroupModel from '@/store/models/Group';
import { observer } from 'mobx-react';
import { observable, computed, action, autorun } from 'mobx';
import { service } from 'sdk';
const { GroupService } = service;
interface IProps {
  id: number;
  key: number;
  entityName: string;
  isFavorite?: boolean;
}

interface IState {
}
@observer
export default class ConversationListItemCell extends React.Component<IProps, IState>{
  static defaultProps = {
    isFavorite: false,
  };

  groupStore: MultiEntityMapStore;

  @observable
  id: number;

  @observable
  displayName: string;

  @observable
  unreadCount: number;

  @observable
  umiVariant: 'count' | 'dot' | 'auto';

  @observable
  status: string;

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
    this.status = '';
    this.groupStore = storeManager.getEntityMapStore(props.entityName) as MultiEntityMapStore;
    this._openMenu = this._openMenu.bind(this);
    this._toggleFavorite = this._toggleFavorite.bind(this);
    this._handleClose = this._handleClose.bind(this);
    this._onClick = this._onClick.bind(this);
    this.isFavorite = !!props.isFavorite;
    this.favoriteText = this.isFavorite ? 'UnFavorite' : 'Favorite';

    autorun(() => {
      const group: GroupModel = this.groupStore.get(this.id);
      this.displayName = group.setAbbreviation;
      this.umiVariant = group.isTeam ? 'auto' : 'count'; // || at_mentions
      this.status = ''; // should get from state store
    });
  }

  render() {
    return (
      <React.Fragment>
        <ConversationListItem
          aria-owns={open ? 'render-props-menu' : undefined}
          aria-haspopup="true"
          key={this.id}
          title={this.displayName}
          unreadCount={this.unreadCount}
          umiVariant={this.umiVariant}
          onMoreClick={this._openMenu}
          onClick={this._onClick}
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
  }

  @action
  private _toggleFavorite() {
    console.log('_toggleFavorite()');
    const groupService: service.GroupService = GroupService.getInstance();
    groupService.markGroupAsFavorite(this.id, !this.isFavorite);

    this._handleClose();
  }
}
