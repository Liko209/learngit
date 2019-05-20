/*
 * @Author: Aaron Huo (aaron.huo@ringcentral.com)
 * @Date: 2019-05-09 09:53:22
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import styled from '../../foundation/styled-components';
import { JuiConversationPageMemberProps } from './types';
import { RuiTooltip } from 'rcui/components/Tooltip';
import { JuiIconography } from '../../foundation/Iconography';
import { grey, typography, width } from '../../foundation/utils/styles';
import { darken } from '@material-ui/core/styles/colorManipulator';
import { IconButtonSize, iconSizes } from '../../components/Buttons';

type MemberProps = {
  size?: IconButtonSize;
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
    margin-left: ${width(1)};
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

class JuiConversationPageMember extends React.Component<
  JuiConversationPageMemberProps
> {
  render() {
    const { onClick, ariaLabel, title, children, size } = this.props;

    return (
      <RuiTooltip title={title}>
        <StyledConversationPageMember
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
