/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-05-23 15:06:23
 * Copyright © RingCentral. All rights reserved.
 */
import React, { Component } from 'react';
import { GLOBAL_STORE_DATA, ACTIONS_TYPE } from '@/constants';
import storeManager from '@/store';
import styled from 'styled-components';

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
  name: string;
  postId: number;
}
export default class QuoteActions extends Component<Props> {
  constructor(props: Props) {
    super(props);
    this.emitQuote = this.emitQuote.bind(this);
  }
  emitQuote() {
    const { postId } = this.props;
    const globalStore = storeManager.getGlobalStore();
    globalStore.set(GLOBAL_STORE_DATA.MODIFY_POST, {
      postId,
      type: ACTIONS_TYPE.QUOTE,
    });
  }
  render() {
    return (
      <Wrapper onClick={this.emitQuote}>
        <Name>{this.props.name}</Name>
      </Wrapper>
    );
  }
}
