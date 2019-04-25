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
  spacing,
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
  }
  &.selected {
    .label {
      ${typography('body2')};
      color: ${primary('700')}
    }
  }
  .labelContainer {
    padding-left: ${spacing(2)};
    padding-right: ${spacing(2)};
    ${ellipsis()}
    width: 100%;
    box-sizing: border-box;
  }
  .label {
    ${typography('body1')}
    color: ${grey('900')}
  }
`;

const StyledTab = React.forwardRef(
  ({ children, ...rest }: StyledTabProps, ref: React.RefObject<any>) => {
    const Tab = <StyledMuiTab {...rest}>{children}</StyledMuiTab>;
    if (ref) {
      return <RootRef rootRef={ref}>{Tab}</RootRef>;
    }
    return Tab;
  },
);

export { StyledTab, StyledTabProps };
