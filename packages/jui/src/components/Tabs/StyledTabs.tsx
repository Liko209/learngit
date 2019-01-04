/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2019-01-02 13:56:10
 * Copyright © RingCentral. All rights reserved.
 */

import MuiTabs, { TabsProps as MuiTabsProps } from '@material-ui/core/Tabs';
import styled from '../../foundation/styled-components';
import { height, spacing } from '../../foundation/utils';

const StyledTabs = styled<MuiTabsProps>(MuiTabs)`
  &.root {
    padding: ${spacing(0, 2)};
    min-height: ${height(8)};
    position: relative;
  }
`;

export { StyledTabs };
