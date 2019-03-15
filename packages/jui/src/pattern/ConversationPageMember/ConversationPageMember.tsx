import React from 'react';
import styled from '../../foundation/styled-components';
import { JuiConversationPageMemberProps } from './types';
import { JuiArrowTip } from '../../components';
import { JuiIconography } from '../../foundation/Iconography';
import { spacing, grey, typography } from '../../foundation/utils/styles';
import { darken } from '@material-ui/core/styles/colorManipulator';

const StyledConversationPageMember = styled.div`
  display: inline-flex;
  flex: none;
  align-self: center;
  align-items: center;
  padding: ${spacing(1, 3)};
  color: ${grey('500')};
  cursor: pointer;

  > span {
    ${typography('body1')};
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
    const { onClick, ariaLabel, title, children } = this.props;

    return (
      <JuiArrowTip title={title}>
        <StyledConversationPageMember aria-label={ariaLabel} onClick={onClick}>
          <JuiIconography iconSize="medium">member_count</JuiIconography>
          {children}
        </StyledConversationPageMember>
      </JuiArrowTip>
    );
  }
}

export { JuiConversationPageMember, StyledConversationPageMember };
