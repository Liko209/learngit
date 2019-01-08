/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2019-01-02 10:54:22
 * Copyright © RingCentral. All rights reserved.
 */

import styled from '../../foundation/styled-components';

const StyledContainer = styled('div')`
  flex: 1;
  display: none;
  &.show {
    display: block;
  }
`;

export { StyledContainer };
