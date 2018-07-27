/*
 * @Author: Jeffrey Huang (jeffrey.huang@ringcentral.com)
 * @Date: 2018-05-24 09:45:55
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import styled from 'styled-components';
import { observer } from 'mobx-react';
import storeManager, { ENTITY_NAME } from '@/store';
import MultiEntityMapStore from '@/store/base/MultiEntityMapStore';
import { service } from 'sdk';

const { GroupService } = service;

const Wrapper = styled.div`
  cursor: pointer;
  margin-left: 10px;
  display: inline-block;
  &:hover {
    color: #0684bd;
  }
`;

const Name = styled.span`
  font-size: 12px;
`;

interface Props {
  postId: number;
}

@observer
class PinActions extends Component<Props> {
  isPin: boolean;
  groupId: number;
  constructor(props: Props) {
    super(props);
    const { postId } = this.props;
    const postStore: MultiEntityMapStore = storeManager.getEntityMapStore(
      ENTITY_NAME.POST,
    ) as MultiEntityMapStore;
    this.groupId = postStore.get(postId).group_id;

    this.emitAction = this.emitAction.bind(this);
    this.emitPin = this.emitPin.bind(this);
    this.emitUnPin = this.emitUnPin.bind(this);
  }

  emitAction() {
    if (this.isPin) {
      this.emitUnPin();
    } else {
      this.emitPin();
    }
  }

  emitPin() {
    const { postId } = this.props;
    GroupService.getInstance().pinPost(postId, this.groupId, true);
  }

  emitUnPin() {
    const { postId } = this.props;
    GroupService.getInstance().pinPost(postId, this.groupId, false);
  }

  render() {
    const { postId } = this.props;
    const groupStore: MultiEntityMapStore = storeManager.getEntityMapStore(
      ENTITY_NAME.GROUP,
    ) as MultiEntityMapStore;
    const { pinnedPostIds = [] } = groupStore.get(this.groupId);
    this.isPin = pinnedPostIds.includes(postId);
    return (
      <Wrapper onMouseDown={this.emitAction}>
        <Name>{this.isPin ? 'Unpin' : 'Pin'}</Name>
      </Wrapper>
    );
  }
}

export default PinActions;
