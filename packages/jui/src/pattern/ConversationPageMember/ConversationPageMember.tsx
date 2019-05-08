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

  &&& {
    margin-left: ${width(1)};
  }

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

    > button {
      display: block;
    }
  }

  > button {
    display: none;
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: 100%;
    opacity: 0;
    cursor: pointer;
  }
`;

class JuiConversationPageMember extends React.Component<
  JuiConversationPageMemberProps
> {
  render() {
    const { onClick, ariaLabel, title, children, size } = this.props;

    return (
      <RuiTooltip title={title}>
        <StyledConversationPageMember aria-label={ariaLabel} size={size}>
          <JuiIconography iconSize="medium">member_count</JuiIconography>
          <button onClick={onClick} />
          {children}
        </StyledConversationPageMember>
      </RuiTooltip>
    );
  }
}

export { JuiConversationPageMember, StyledConversationPageMember };
