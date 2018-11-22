/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-11-22 10:52:22
 * Copyright © RingCentral. All rights reserved.
 */

import styled from '../../foundation/styled-components';

type StyledWrapperProps = {
  left: number;
  top: number;
};

const StyledWrapper = styled<StyledWrapperProps, 'div'>('div')`
  position: absolute;
  left: ${({ left }: StyledWrapperProps) => `${left}px`};
  top: ${({ top }: StyledWrapperProps) => `${top}px`};
  z-index: ${({ theme }) => `${theme.zIndex.modal}`};
  width: 200px;
`;

export { StyledWrapper };
