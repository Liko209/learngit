/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-09-29 15:44:48
 * Copyright © RingCentral. All rights reserved.
 */

import styled from '../../foundation/styled-components';
import { JuiLogo } from './Logo';
import { MenuListCompositionWrapper } from '../HistoryOperation';

const StyledLeft = styled('div')`
  display: flex;
  align-items: center;
  flex: 1;
  @media (max-width: 805px) {
    .topBar-search-bar {
      display: none;
    }
  }
  @media (max-width: 730px) {
    ${MenuListCompositionWrapper} {
      display: none;
    }
  }
  @media (max-width: 650px) {
    ${JuiLogo} {
      display: none;
    }
  }
`;

StyledLeft.displayName = 'StyledLeft';

export { StyledLeft };
