/*
 * @Author: Lip Wang (lip.wangn@ringcentral.com)
 * @Date: 2018-08-17 14:44:46
 * Copyright © RingCentral. All rights reserved.
 */

import React from 'react';
import _ from 'lodash';
import {
  ConversationListItem,
} from 'ui-components';
import storeManager, { ENTITY_NAME } from '../../store';
import MultiEntityMapStore from '../../store/base/MultiEntityMapStore';
import SingleEntityMapStore from '../../store/base/SingleEntityMapStore';
import GroupModel from '../../store/models/Group';
import { observer } from 'mobx-react';
import { getGroupName } from '../../utils/groupName';
interface IProps {
  id: number;
  key: number;
  entityName: string;
  currentUserId?: number;
}

interface IState {
}
@observer
export default class ConversationListItemCell extends React.Component<IProps, IState>{
  id: number;
  displayName: string;
  unreadCount: number;
  umiVariant: 'auto' | 'dot' | 'count';
  status: string;
  groupStore: MultiEntityMapStore | SingleEntityMapStore;
  presenceStore: MultiEntityMapStore | SingleEntityMapStore;
  constructor(props: IProps) {
    super(props);
    this.id = props.id;
    this.displayName = '';
    this.unreadCount = 0;
    this.status = '';
    this.groupStore = storeManager.getEntityMapStore(props.entityName);
    this.presenceStore = storeManager.getEntityMapStore(ENTITY_NAME.PRESENCE);
  }

  getDataFromStore() {
    const group: GroupModel = this.groupStore.get(this.id);
    const { currentUserId } = this.props;
    this.displayName = getGroupName(group, currentUserId);
    this.umiVariant = group.isTeam ? 'auto' : 'count'; // || at_mentions
    this.status = '';
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
    this.getDataFromStore();
    return (
      <ConversationListItem
        key={this.id}
        title={this.displayName || ''}
        unreadCount={this.unreadCount}
        umiVariant={this.umiVariant}
        status={this.status}
      />
    );
  }
}
