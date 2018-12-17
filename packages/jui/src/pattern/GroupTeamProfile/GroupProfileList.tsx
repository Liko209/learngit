/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-11-22 14:09:02
 * Copyright © RingCentral. All rights reserved.
 */
import React, { PureComponent } from 'react';
import styled from '../../foundation/styled-components';
import {
  spacing,
  grey,
  height,
} from '../../foundation/utils/styles';
const StyledItem = styled.li`
  display: flex;
  height: ${height(12)};
  background-color: ${({ theme }) => theme.palette.common.white};
  align-items: center;
  &:hover{
    background-color: ${grey('100')};
  }
  &:nth-last-child(1) {
    margin-bottom: ${spacing(10)};
  }
  padding-left: ${spacing(8)};
`;

class JuiGroupProfileList extends PureComponent {
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
