/*
 * @Author: Aaron Huo (aaron.huo@ringcentral.com)
 * @Date: 2019-05-09 09:53:22
 * Copyright © RingCentral. All rights reserved.
 */
import React, { PureComponent } from 'react';
import styled from '../../foundation/styled-components';
import { JuiConversationPageMemberProps } from './types';
import { RuiTooltip } from 'rcui/components/Tooltip';
import { JuiIconography } from '../../foundation/Iconography';
import {
  grey,
  typography,
  width,
  spacing,
} from '../../foundation/utils/styles';
import { darken } from '@material-ui/core/styles/colorManipulator';
import { IconButtonSize, iconSizes } from '../../components/Buttons';

type MemberProps = {
  size?: IconButtonSize;
  automationId?: string;
};

const StyledConversationPageMember = styled.button<MemberProps>`
  position: relative;
  display: inline-flex;
  flex: none;
  align-self: center;
  align-items: center;
  border: none;
  padding: 0;
  height: ${({ size = 'medium', theme }) =>
    width(iconSizes[size] * 2)({ theme })};
  background: none;
  color: ${grey('500')};
  cursor: pointer;

  &&& {
    padding: ${spacing(0, 2.5)};
  }

  :active {
    outline: none;
  }

  :hover {
    color: ${({
      theme: {
        palette: { tonalOffset, grey },
      },
    }) => darken(grey['500'], tonalOffset)};
  }

  > span {
    ${typography('body1')};
  }
`;

class JuiConversationPageMember extends PureComponent<
  JuiConversationPageMemberProps
> {
  render() {
    const {
      onClick,
      ariaLabel,
      title,
      children,
      size,
      automationId,
    } = this.props;

    return (
      <RuiTooltip title={title}>
        <StyledConversationPageMember
          data-test-automation-id={automationId}
          aria-label={ariaLabel}
          onClick={onClick}
          size={size}
        >
          <JuiIconography iconSize="medium">member_count</JuiIconography>
          {children}
        </StyledConversationPageMember>
      </RuiTooltip>
    );
  }
}

export { JuiConversationPageMember, StyledConversationPageMember };
