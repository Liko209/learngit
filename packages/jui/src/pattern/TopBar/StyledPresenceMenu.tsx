/*
 * @Author: Spike.Yang
 * @Date: 2019-07-29 15:29:59
 * Copyright © RingCentral. All rights reserved.
 */

import { JuiSubMenu, JuiMenuItem } from '../../components/Menus';
import { spacing } from '../../foundation/utils';
import styled from '../../foundation/styled-components';

const StyledPresenceMenu = styled(JuiSubMenu)`
  && {
    font-size: ${spacing(3.5)};
  }
`;

const StyledPresenceMenuItem = styled(JuiMenuItem)`
  && {
    font-size: ${spacing(3.5)};
  }
`;

StyledPresenceMenu.displayName = 'StyledPresenceMenu';

export { StyledPresenceMenu, StyledPresenceMenuItem };
