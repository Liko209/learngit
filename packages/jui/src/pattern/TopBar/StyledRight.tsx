/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-09-29 17:42:47
 * Copyright © RingCentral. All rights reserved.
 */

import styled from '../../foundation/styled-components';
import { StyledSearchIconButton } from './StyledSearchIconButton';

const StyledRight = styled('div')`
  display: flex;
  align-items: center;
  justify-content: flex-end;

  ${StyledSearchIconButton} {
    display: none;
  }

  @media (max-width: 805px) {
    ${StyledSearchIconButton} {
      display: flex;
    }
  }
`;

StyledRight.displayName = 'StyledRight';

export { StyledRight };
