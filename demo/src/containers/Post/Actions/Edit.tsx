/*
 * @Author: Lily.li (lily.li@ringcentral.com)
 * @Date: 2018-05-15 13:24:31
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
export default class EditActions extends Component<Props> {
  constructor(props: Props) {
    super(props);
    this.emitEdit = this.emitEdit.bind(this);
  }
  emitEdit() {
    const { postId } = this.props;
    const globalStore = storeManager.getGlobalStore();
    globalStore.set(GLOBAL_STORE_DATA.MODIFY_POST, {
      postId,
      type: ACTIONS_TYPE.EDIT,
    });
  }
  render() {
    return (
      <Wrapper onClick={this.emitEdit}>
        <Name>{this.props.name}</Name>
      </Wrapper>
    );
  }
}
