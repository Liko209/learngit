/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-11-27 14:33:02
 * Copyright © RingCentral. All rights reserved.
 */
import styled from '../../foundation/styled-components';
import {
  spacing,
  ellipsis,
} from '../../foundation/utils/styles';
const StyledList = styled.ul`
  -ms-overflow-style: -ms-autohiding-scrollbar;
  list-style: none;
  padding: 0;
  margin: 0;
`;
const StyledName = styled.p`
  margin-left: ${spacing(3)};
  ${ellipsis()}
`;
export { StyledList, StyledName };
