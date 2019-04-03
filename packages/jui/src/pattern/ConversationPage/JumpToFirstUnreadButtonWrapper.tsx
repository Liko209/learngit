import React, { HTMLAttributes, memo } from 'react';
import styled from '../../foundation/styled-components';
import { spacing } from '../../foundation/utils';

type JuiJumpToFirstUnreadButtonWrapperProps = HTMLAttributes<HTMLElement>;

const StyledDiv = styled.div`
  position: absolute;
  top: ${spacing(4)};
  transform: translateX(-50%);
  left: 50%;
`;

const JuiJumpToFirstUnreadButtonWrapper = memo(
  (props: JuiJumpToFirstUnreadButtonWrapperProps) => (
    <StyledDiv
      {...props}
      data-test-automation-id="jump-to-first-unread-button"
    />
  ),
);

export {
  JuiJumpToFirstUnreadButtonWrapper,
  JuiJumpToFirstUnreadButtonWrapperProps,
};
