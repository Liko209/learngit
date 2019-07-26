import React, { HTMLAttributes, memo } from 'react';
import styled from '../../foundation/styled-components';
import { spacing } from '../../foundation/utils';

type JuiAnchorButtonWrapperProps = HTMLAttributes<HTMLElement>;

const StyledDiv = styled.div`
  position: absolute;
  top: ${spacing(4)};
  transform: translateX(-50%);
  left: 50%;
`;

const JuiAnchorButtonWrapper = memo((props: JuiAnchorButtonWrapperProps) => (
  <StyledDiv {...props} />
));

export { JuiAnchorButtonWrapper, JuiAnchorButtonWrapperProps };
