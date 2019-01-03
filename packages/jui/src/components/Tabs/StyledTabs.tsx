/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2019-01-02 13:56:10
 * Copyright © RingCentral. All rights reserved.
 */

import MuiTabs from '@material-ui/core/Tabs';
import styled from '../../foundation/styled-components';
import { height, spacing } from '../../foundation/utils';

const StyledTabs = styled(MuiTabs)`
  &.root {
    padding: ${spacing(0, 2)};
    min-height: ${height(8)};
  }
`;

export { StyledTabs };
