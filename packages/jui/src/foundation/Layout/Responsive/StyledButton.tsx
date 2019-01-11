/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-09-27 16:28:48
 * Copyright © RingCentral. All rights reserved.
 */

import styled from '../../styled-components';
import { width, height } from '../../utils/styles';

// todo: have not UX design
const StyledButton = styled('div')`
  width: ${width(2.5)};
  height: ${height(5)};
  cursor: pointer;
  background-color: red;
  z-index: ${({ theme }) => theme.zIndex.drawer};
`;

export { StyledButton };
