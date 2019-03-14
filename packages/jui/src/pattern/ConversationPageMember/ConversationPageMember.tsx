import React from 'react';
import styled from '../../foundation/styled-components';
import { JuiConversationPageMemberProps } from './types';
import { JuiArrowTip } from '../../components';
import { JuiIconography } from '../../foundation/Iconography';
import { spacing } from '../../foundation/utils/styles';
import { darken } from '@material-ui/core/styles/colorManipulator';
import i18next from 'i18next';

const StyledConversationPageMember = styled.div`
  display: inline-flex;
  flex: none;
  align-self: center;
  align-items: center;
  padding: ${spacing(1)} ${spacing(3)};
  color: ${({
    theme: {
      palette: { grey },
    },
  }) => grey['500']};
  cursor: pointer;

  > span {
    ${({ theme: { typography } }) => typography['caption1']};
  }

  :hover {
    color: ${({
      theme: {
        palette: { grey },
      },
    }) => darken(grey['500'], 0.2)};
  }
`;

class JuiConversationPageMember extends React.Component<
  JuiConversationPageMemberProps
> {
  render() {
    const { onClick, children } = this.props;

    return (
      <JuiArrowTip title={i18next.t('people.team.Members')}>
        <StyledConversationPageMember
          data-test="conversation-"
          aria-label={i18next.t('people.team.Members')}
          onClick={onClick}
        >
          <JuiIconography iconSize="medium">member_count</JuiIconography>
          {children}
        </StyledConversationPageMember>
      </JuiArrowTip>
    );
  }
}

export { JuiConversationPageMember, StyledConversationPageMember };
