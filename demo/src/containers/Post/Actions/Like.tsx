/*
 * @Author: Jeffrey Huang (jeffrey.huang@ringcentral.com)
 * @Date: 2018-05-24 09:45:55
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import styled from 'styled-components';
import { observer } from 'mobx-react';
import storeManager, { ENTITY_NAME } from '#/store';
import MultiEntityMapStore from '#/store/base/MultiEntityMapStore';
import { service } from 'sdk';

const { AccountService, PostService } = service;

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
class LikeActions extends Component<Props> {
  userId: number;
  isLike: boolean;
  constructor(props: Props) {
    super(props);
    this.userId = AccountService.getInstance().getCurrentUserId();
    this.emitAction = this.emitAction.bind(this);
    this.emitLike = this.emitLike.bind(this);
    this.emitUnlike = this.emitUnlike.bind(this);
  }

  emitAction() {
    if (this.isLike) {
      this.emitUnlike();
    } else {
      this.emitLike();
    }
  }

  emitLike() {
    const { postId } = this.props;
    PostService.getInstance().likePost(postId, this.userId, true);
  }

  emitUnlike() {
    const { postId } = this.props;
    PostService.getInstance().likePost(postId, this.userId, false);
  }

  render() {
    const { postId } = this.props;
    const postStore: MultiEntityMapStore = storeManager.getEntityMapStore(
      ENTITY_NAME.POST,
    ) as MultiEntityMapStore;
    const { likes = [] } = postStore.get(postId);
    this.isLike = likes.includes(this.userId);
    return (
      <Wrapper onMouseDown={this.emitAction}>
        <Name>{this.isLike ? 'Unlike' : 'Like'}</Name>
      </Wrapper>
    );
  }
}

export default LikeActions;
