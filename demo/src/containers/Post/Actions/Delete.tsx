/*
 * @Author: Jeffrey Huang (jeffrey.huang@ringcentral.com)
 * @Date: 2018-05-24 09:45:55
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import styled from 'styled-components';
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
  name: string;
  postId: number;
}

export default class DeleteActions extends Component<Props> {
  constructor(props: Props) {
    super(props);
    this.emitAction = this.emitAction.bind(this);
  }

  emitAction() {
    const { postId } = this.props;
    PostService.getInstance().deletePost(postId);
  }

  render() {
    return (
      <Wrapper onMouseDown={this.emitAction}>
        <Name>{this.props.name}</Name>
      </Wrapper>
    );
  }
}
