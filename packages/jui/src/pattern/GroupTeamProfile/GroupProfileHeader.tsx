/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-11-22 11:09:02
 * Copyright © RingCentral. All rights reserved.
 */
import React, { PureComponent } from 'react';
import styled from '../../foundation/styled-components';
import { JuiIconButton } from '../../components/Buttons/IconButton';
import { spacing, grey, height, width, palette } from '../../foundation/utils/styles';
import { GroupHeaderProps } from './types';

const StyledHeader = styled.div`
  width: 100%;
  background-color: ${palette('common', 'white')};
  line-height: ${height(16)};
  color: ${grey('900')};
  font-size: ${({ theme }) => theme.typography.h6.fontSize};
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
  align-items: center;
  height: 100%;
  .close {
    color: ${grey('500')};
    font-size: ${({ theme }) => theme.typography.h6.fontSize};
    height: ${height(10)};
    margin-left: ${spacing(-3)};
    width: ${width(10)};
    border-radius: 50%;
  }
  div {
    z-index: ${({ theme }) => theme.zIndex.moreMenu};
  }
  .privacy,
  .favorite {
    margin-right: ${spacing(3)};
  }
  .horiz-menu {
    margin-left: ${spacing(-3)};
  }
`;
const StyledText = styled.p`
  color: ${grey('900')};
  font-size: ${({ theme }) => theme.typography.h6.fontSize};
`;
class JuiGroupProfileHeader extends PureComponent<GroupHeaderProps> {
  render() {
    const { title, dismiss, children, toolTipCloseTitle } = this.props;

    return (
      <StyledHeader>
        <StyledContent>
          <StyledText>{title}</StyledText>
          <StyledIcon>
            {children}
            <JuiIconButton
              onClick={dismiss}
              className="close"
              disableToolTip={false}
              tooltipTitle={toolTipCloseTitle}
            >
              close
            </JuiIconButton>
          </StyledIcon>
        </StyledContent>
      </StyledHeader>
    );
  }
}

export { JuiGroupProfileHeader };
