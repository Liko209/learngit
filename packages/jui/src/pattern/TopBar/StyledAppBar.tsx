/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-09-29 15:44:48
 * Copyright © RingCentral. All rights reserved.
 */

import { JuiAppBar } from '../../components/AppBar';
import styled from '../../foundation/styled-components';
import { palette } from '../../foundation/utils';

const StyledAppBar = styled(JuiAppBar).attrs({ position: 'static' })`
  && {
    min-height: 64px;
    min-width: 400px;
    background-color: ${({ theme }) => `${theme.palette.common.white}`};
    background: linear-gradient(
      to right,
      ${palette('primary', 'main')},
      ${palette('primary', '300')}
    );
    box-shadow: none;
    border-bottom: 1px solid
      rgba(0, 0, 0, ${({ theme }) => `${theme.palette.action.hoverOpacity}`});
    z-index: ${({ theme }) => `${theme.zIndex.drawer + 10}`};
  }
`;

StyledAppBar.displayName = 'StyledAppBar';

export { StyledAppBar };
