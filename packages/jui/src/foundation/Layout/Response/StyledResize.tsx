/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-09-27 16:20:52
 * Copyright © RingCentral. All rights reserved.
 */

import styled from '../../styled-components';

type Props = {
  offset: number;
  show: boolean;
};

const StyledResize = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  right: auto;
  cursor: col-resize;
  background-color: transparent;
  z-index: ${({ theme }) => theme.zIndex.modal};
  margin-left: ${({ theme }) => -theme.spacing.unit}px;
  padding: ${({ theme }) => theme.spacing.unit}px;
  left: ${({ offset }: Props) => `${offset}px`};
  display: ${({ show }: Props) => (show ? 'block' : 'none')};
`;

export { StyledResize };
