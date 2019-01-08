/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2019-01-02 13:56:10
 * Copyright © RingCentral. All rights reserved.
 */

import React from 'react';
import RootRef from '@material-ui/core/RootRef';
import MuiTabs, { TabsProps as MuiTabsProps } from '@material-ui/core/Tabs';
import styled from '../../foundation/styled-components';
import { height, spacing, grey } from '../../foundation/utils';

type StyledTabsProps = MuiTabsProps & { ref?: React.RefObject<any> };

const StyledMuiTabs = styled<MuiTabsProps>(MuiTabs)`
  &.root {
    padding: ${spacing(0, 2)};
    min-height: ${height(8)};
    position: relative;
    border-bottom: 1px solid ${grey('300')};
  }
`;

const StyledTabs = React.forwardRef(
  ({ children, ...rest }: StyledTabsProps, ref: React.RefObject<any>) => {
    const Tabs = <StyledMuiTabs {...rest}>{children}</StyledMuiTabs>;
    if (ref) {
      return <RootRef rootRef={ref}>{Tabs}</RootRef>;
    }
    return Tabs;
  },
);

export { StyledTabs, StyledTabsProps };
