/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2018-05-24 14:30:18
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { observer } from 'mobx-react';
import styled from 'styled-components';
import storeManager, { ENTITY_NAME } from '#/store';

export const PinItem = styled.div`
  text-overflow: ellipsis;
  border: 1px solid transparent;
  line-height: 26px;
  border-radius: 8px;
  .title {
    white-space: nowrap;
    cursor: pointer;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

const Pin = observer(props => {
  const { id } = props;
  const postStore = storeManager.getEntityMapStore(ENTITY_NAME.POST);
  const post = postStore.get(id);
  const { text } = post;
  return (
    <PinItem>
      <div className="title">[Pin] {text}</div>
    </PinItem>
  );
});

export default Pin;
