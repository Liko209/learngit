/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-09-29 15:44:48
 * Copyright © RingCentral. All rights reserved.
 */

import { JuiToolbar } from '../../components/Toolbar';
import styled from '../../foundation/styled-components';
import { spacing } from '../../foundation/utils';

const StyledToolbar = styled(JuiToolbar)`
  && {
    min-height: 64px;
    justify-content: space-between;
    padding: 0 ${spacing(4)};
    &:hover {
      .react-select__control {
        background: ${({ theme }) => theme.palette.grey[300]};
        border: 1px solid ${({ theme }) => theme.palette.grey[300]};
      }
    }
  }
`;

StyledToolbar.displayName = 'StyledToolbar';
StyledToolbar.dependencies = [];

export { StyledToolbar };
