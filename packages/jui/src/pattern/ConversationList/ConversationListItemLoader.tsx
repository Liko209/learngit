import * as React from 'react';
import { RuiCircularProgress } from 'rcui/components/Progress';
import styled from '../../foundation/styled-components';
// import MuiMenuItem from '@material-ui/core/MenuItem';

const StyledContainer = styled.li`
  display: flex;
  justify-content: center;
  padding: 8px;
  &:active,
  &:focus {
    outline: none;
  }
`;
export function JuiConversationListItemLoader() {
  return (
    <StyledContainer tabIndex={-1}>
      <RuiCircularProgress
        disableShrink
        size={24}
        data-test-automation-id="conversation-list-spinner"
      />
    </StyledContainer>
  );
}
