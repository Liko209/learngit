/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-11-22 11:09:02
 * Copyright © RingCentral. All rights reserved.
 */
import React, { PureComponent } from 'react';
import styled from '../../foundation/styled-components';
import { JuiIconButton } from '../../components/Buttons/IconButton';
import {
  spacing,
  grey,
  height,
  width,
} from '../../foundation/utils/styles';
import { GroupHeaderProps } from './types';

const StyledHeader = styled.div`
  height: ${height(16)};
  width: 100%;
  background-color: #fff;
  line-height: ${height(16)};
  color: ${grey('900')};
  font-size: 20px;
  border-bottom: 1px solid ${grey('300')};
`;
const StyledContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: ${height(16)};
  margin: 0 ${spacing(3)} 0 ${spacing(6)};
`;
const StyledIcon = styled.div`
  display: flex;
  height: 100%;
  .close {
    color: ${grey('500')};
    font-size: 20px;
    height: ${height(5)};
  }
  div {
    z-index: 99999;
    margin-right: ${spacing(3)};
  }
  .horiz-menu {
    width: ${width(5)};
  }
`;
const StyledText = styled.p`
  color: ${grey('900')};
  font-size: ${({ theme }) => theme.typography.h6.fontSize};
`;
class JuiGroupProfileHeader extends PureComponent<GroupHeaderProps> {
  render() {
    const { text, destroy, children } = this.props;

    return (
      <StyledHeader>
        <StyledContent>
          <StyledText>
            {text}
          </StyledText>
          <StyledIcon>
            {children}
            <JuiIconButton onClick={destroy} className="close" isShowToolTip={false}>close</JuiIconButton>
          </StyledIcon>
        </StyledContent>
      </StyledHeader>
    );
  }
}

export { JuiGroupProfileHeader };
