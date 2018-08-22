/*
 * @Author: Lip Wang (lip.wangn@ringcentral.com)
 * @Date: 2018-08-17 14:44:46
 * Copyright © RingCentral. All rights reserved.
 */

import React from 'react';
import {
  ConversationListItem,
} from 'ui-components';
import storeManager from '../../store';
import MultiEntityMapStore from '../../store/base/MultiEntityMapStore';
import SingleEntityMapStore from '../../store/base/SingleEntityMapStore';
import GroupModel from '../../store/models/Group';
import { observer } from 'mobx-react';

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
  umiVariant: 'auto'|'dot'|'count';
  status: string;
  groupStore: MultiEntityMapStore | SingleEntityMapStore;
  constructor(props: IProps) {
    super(props);
    this.id = props.id;
    this.displayName = '';
    this.unreadCount = 0;
    this.status = '';
    this.groupStore = storeManager.getEntityMapStore(props.entityName);
  }

  getDataFromStore() {
    const group: GroupModel = this.groupStore.get(this.id);
    this.displayName = group.setAbbreviation;
    this.umiVariant = group.isTeam ? 'auto' :'count'; // || at_mentions
    this.status = ''; // should get from state store
  }

  render() {
    this.getDataFromStore();
    return (
      <ConversationListItem
        key={this.id}
        title={this.displayName}
        unreadCount={this.unreadCount}
        umiVariant={this.umiVariant}
      />
    );
  }
}
