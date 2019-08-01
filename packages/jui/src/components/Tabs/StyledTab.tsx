/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2019-01-02 10:54:22
 * Copyright © RingCentral. All rights reserved.
 */

import React from 'react';
import RootRef from '@material-ui/core/RootRef';
import MuiTab, { TabProps as MuiTabProps } from '@material-ui/core/Tab';
import styled from '../../foundation/styled-components';
import {
  width,
  height,
  ellipsis,
  typography,
  grey,
  primary,
  spacing
} from '../../foundation/utils';

type StyledTabProps = MuiTabProps & {
  ref?: React.RefObject<any>;
  automationId?: string;
};

const StyledMuiTab = styled<MuiTabProps>(MuiTab)`
  &.root {
    min-width: ${width(8)};
    max-width: ${width(30)};
    min-height: ${height(8)};
    text-transform: none;
    padding: ${({ icon, theme }) => (icon ? '0' : spacing(0, 2)({ theme }))};
    box-sizing: border-box;
    ${typography('body1')};
    color: ${grey('900')};
    .wrapper {
      ${ellipsis()}
      display: inline;
    }
  }
  &.selected {
    ${typography('body2')};
    color: ${primary('700')};
  }
`;

const StyledTab = React.forwardRef(
  ({ children, ...rest }: StyledTabProps, ref: React.RefObject<any>) => {
    const Tab = (
      <StyledMuiTab
        classes={{ root: 'root', selected: 'selected', wrapper: 'wrapper' }}
        {...rest}
      >
        {children}
      </StyledMuiTab>
    );
    if (ref) {
      return <RootRef rootRef={ref}>{Tab}</RootRef>;
    }
    return Tab;
  }
);

export { StyledTab, StyledTabProps };
