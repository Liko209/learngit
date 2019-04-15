import React from 'react';
import styled from '../../foundation/styled-components';
import { JuiConversationPageMemberProps } from './types';
import { JuiArrowTip } from '../../components';
import { JuiIconography } from '../../foundation/Iconography';
import {
  spacing,
  grey,
  typography,
  width,
} from '../../foundation/utils/styles';
import { darken } from '@material-ui/core/styles/colorManipulator';
import { IconButtonSize, iconSizes } from '../../components/Buttons';

type MemberProps = {
  size?: IconButtonSize;
};

const StyledConversationPageMember = styled.button<MemberProps>`
  display: inline-flex;
  flex: none;
  align-self: center;
  align-items: center;
  border: none;
  padding: ${spacing(0, 3)};
  height: ${({ size = 'medium', theme }) =>
    width(iconSizes[size] * 2)({ theme })};
  background: none;
  color: ${grey('500')};
  cursor: pointer;

  > span {
    ${typography('body1')};
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
`;

class JuiConversationPageMember extends React.Component<
  JuiConversationPageMemberProps
> {
  render() {
    const { onClick, ariaLabel, title, children, size } = this.props;

    return (
      <JuiArrowTip title={title}>
        <StyledConversationPageMember
          aria-label={ariaLabel}
          onClick={onClick}
          size={size}
        >
          <JuiIconography iconSize="medium">member_count</JuiIconography>
          {children}
        </StyledConversationPageMember>
      </JuiArrowTip>
    );
  }
}

export { JuiConversationPageMember, StyledConversationPageMember };
