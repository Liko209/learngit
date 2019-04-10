/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2019-01-02 10:54:22
 * Copyright © RingCentral. All rights reserved.
 */

import styled from '../../foundation/styled-components';

const StyledContainer = styled('div')<{ offset: number }>`
  flex: 1;
  display: flex;
  position: absolute;
  right: ${({ offset }) => 10 * offset}px;
  opacity: 0;
  &.show {
    position: static;
    right: unset;
    opacity: 1;
  }
`;

export { StyledContainer };
