/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-09-27 14:20:23
 * Copyright © RingCentral. All rights reserved.
 */

import * as React from 'react';
import MuiGrid, { GridProps as MuiGridProps } from '@material-ui/core/Grid';

export type JuiGridProps = MuiGridProps;

export const JuiGrid: React.SFC<JuiGridProps> & {
  dependencies?: any[];
} = React.memo(props => <MuiGrid {...props} />);

JuiGrid.displayName = 'JuiGrid';
JuiGrid.dependencies = [JuiGrid];
