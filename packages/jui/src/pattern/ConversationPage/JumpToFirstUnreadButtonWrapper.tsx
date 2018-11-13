import { HTMLAttributes } from 'react';
import styled from '../../foundation/styled-components';
import { spacing } from '../../foundation/utils';

type JuiJumpToFirstUnreadButtonWrapperProps = HTMLAttributes<HTMLElement>;

const JuiJumpToFirstUnreadButtonWrapper = styled.div`
  position: absolute;
  top: ${spacing(3)};
  left: 0;
  right: 0;
  text-align: center;
`;

export {
  JuiJumpToFirstUnreadButtonWrapper,
  JuiJumpToFirstUnreadButtonWrapperProps,
};
