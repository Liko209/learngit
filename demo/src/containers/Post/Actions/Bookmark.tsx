/*
 * @Author: Jeffrey Huang (jeffrey.huang@ringcentral.com)
 * @Date: 2018-05-24 09:45:55
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import styled from 'styled-components';
import { observer } from 'mobx-react';

import storeManager, { ENTITY_NAME } from '@/store';
import SingleEntityMapStore from '@/store/base/SingleEntityMapStore';

import { service } from 'sdk';

const { PostService } = service;

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
class BookmarkActions extends Component<Props> {
  isBookmark: boolean;
  constructor(props: Props) {
    super(props);
    this.emitAction = this.emitAction.bind(this);
    this.emitBookmark = this.emitBookmark.bind(this);
    this.emitRemoveBookmark = this.emitRemoveBookmark.bind(this);
  }

  emitAction() {
    if (this.isBookmark) {
      this.emitRemoveBookmark();
    } else {
      this.emitBookmark();
    }
  }

  emitBookmark() {
    const { postId } = this.props;
    PostService.getInstance().bookmarkPost(postId, true);
  }

  emitRemoveBookmark() {
    const { postId } = this.props;
    PostService.getInstance().bookmarkPost(postId, false);
  }

  render() {
    const { postId } = this.props;
    const profileStore: SingleEntityMapStore = storeManager.getEntityMapStore(
      ENTITY_NAME.PROFILE,
    ) as SingleEntityMapStore;
    const favoritePostIds = profileStore.get('favoritePostIds');
    this.isBookmark = favoritePostIds && favoritePostIds.includes(postId);
    return (
      <Wrapper onMouseDown={this.emitAction}>
        <Name>{this.isBookmark ? 'Remove Bookmark' : 'Bookmark'}</Name>
      </Wrapper>
    );
  }
}

export default BookmarkActions;
