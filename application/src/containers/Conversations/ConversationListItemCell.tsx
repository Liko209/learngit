/*
 * @Author: Lip Wang (lip.wangn@ringcentral.com)
 * @Date: 2018-08-17 14:44:46
 * Copyright © RingCentral. All rights reserved.
 */

import React from 'react';
import {
  Menu,
  MenuItem,
  Popper,
  ConversationListItem,
} from 'ui-components';
import storeManager from '@/store';
import MultiEntityMapStore from '@/store/base/MultiEntityMapStore';
import GroupModel from '@/store/models/Group';
import { observer } from 'mobx-react';
import { observable } from '../../../../node_modules/mobx';

interface IProps {
  id: number;
  key: number;
  entityName: string;
}

interface IState {
}
@observer
export default class ConversationListItemCell extends React.Component<IProps, IState>{
  id: number;
  displayName: string;
  unreadCount: number;
  umiVariant: 'count' | 'dot' | 'auto';
  status: string;
  groupStore: MultiEntityMapStore;
  @observable
  menuOpen: boolean;
  anchorEl: HTMLElement;

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
  }

  getDataFromStore() {
    const group: GroupModel = this.groupStore.get(this.id);
    this.displayName = group.setAbbreviation;
    this.umiVariant = group.isTeam ? 'auto' : 'count'; // || at_mentions
    this.status = ''; // should get from state store
  }

  render() {
    this.getDataFromStore();
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
        />
        <Menu id="render-props-menu" anchorEl={this.anchorEl} open={this.menuOpen}>
          <MenuItem onClick={this._toggleFavorite}>Favorite</MenuItem>
        </Menu>
      </React.Fragment>
    );
  }

  private _openMenu(event: React.MouseEvent<HTMLElement>) {
    const { currentTarget } = event;
    this.anchorEl = currentTarget;
    this.menuOpen = true;
  }

  private _toggleFavorite() {
    console.log('_toggleFavorite()');
    this.menuOpen = false;
  }
}
