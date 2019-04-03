/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-09-29 15:44:48
 * Copyright © RingCentral. All rights reserved.
 */

import { JuiToolbar } from '../../components/Toolbar';
import styled from '../../foundation/styled-components';
import { height, spacing } from '../../foundation/utils';

const StyledToolbar = styled(JuiToolbar)`
  && {
    min-height: ${height(16)};
    justify-content: space-between;
    padding: ${spacing(0, 4, 0, 2)};
  }
`;

StyledToolbar.displayName = 'StyledToolbar';

export { StyledToolbar };
