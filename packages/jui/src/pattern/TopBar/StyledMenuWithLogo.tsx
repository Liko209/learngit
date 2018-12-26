/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-09-29 16:16:18
 * Copyright © RingCentral. All rights reserved.
 */

import styled from '../../foundation/styled-components';

const StyledMenuWithLogo = styled('div')`
  display: flex;
  align-items: center;
  /* ie compatibility for Topbar width less than 1100px */
  flex-shrink: 0;
`;

StyledMenuWithLogo.displayName = 'StyledMenuWithLogo';

export { StyledMenuWithLogo };
