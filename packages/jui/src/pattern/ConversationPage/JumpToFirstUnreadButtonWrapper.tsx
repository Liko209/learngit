import React, { HTMLAttributes } from 'react';
import styled from '../../foundation/styled-components';
import { spacing } from '../../foundation/utils';

type JuiJumpToFirstUnreadButtonWrapperProps = HTMLAttributes<HTMLElement>;

const StyledDiv = styled.div`
  position: absolute;
  top: ${spacing(4)};
  left: 0;
  right: 0;
  text-align: center;
`;

const JuiJumpToFirstUnreadButtonWrapper = (
  props: JuiJumpToFirstUnreadButtonWrapperProps,
) => (
  <StyledDiv {...props} data-test-automation-id="jump-to-first-unread-button" />
);

export {
  JuiJumpToFirstUnreadButtonWrapper,
  JuiJumpToFirstUnreadButtonWrapperProps,
};
