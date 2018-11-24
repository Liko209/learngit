/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-11-22 14:09:02
 * Copyright © RingCentral. All rights reserved.
 */
import React, { PureComponent } from 'react';
import { GroupListProps } from './types';
import styled from '../../foundation/styled-components';

const StyledItem = styled.li`
  display: flex;
  height: 48px;
  background-color: #fff;
  align-items: center;
  &:hover{
    background-color: #f5f5f5;
  }
  &:nth-last-child(1) {
    margin-bottom: 44px;
  }
  div {
    margin-right: 14px;
    margin-left: 24px;
  }
`;

class JuiGroupProfileList extends PureComponent<GroupListProps> {
  render() {
    const { children } = this.props;
    return (
      <StyledItem>
        {children}
      </StyledItem>
    );
  }
}

export { JuiGroupProfileList };
