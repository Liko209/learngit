/*
 * @Author: Lip Wang (lip.wangn@ringcentral.com)
 * @Date: 2018-08-17 14:44:46
 * Copyright © RingCentral. All rights reserved.
 */

import React from 'react';
import {
  ConversationListItem,
} from 'ui-components';

interface IProps {
  id: number;
  key: number;
}

interface IState {
  // groups: Group[];
}

export default class ConversationListItemCell extends React.Component<IProps, IState>{
  id: number;
  displayName: string;
  unreadCount: number;
  showCount: boolean;
  status: string;
  constructor(props: IProps) {
    super(props);
    this.id = props.id;
    this.displayName = '123';
    this.unreadCount = 10;
    this.showCount = true;
  }

  render() {
    return (
      <ConversationListItem
        key={this.id}
        status="online"
        title={this.displayName}
        unreadCount={this.unreadCount}
        showCount={this.showCount}
      />
    );
  }
}
