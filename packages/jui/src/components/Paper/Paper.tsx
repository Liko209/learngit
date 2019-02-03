/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-09-27 14:44:04
 * Copyright © RingCentral. All rights reserved.
 */
import * as React from 'react';
import MuiPaper, { PaperProps as MuiPaperProps } from '@material-ui/core/Paper';

export type JuiPaperProps = MuiPaperProps;

export const JuiPaper: React.SFC<JuiPaperProps> & {
  dependencies?: any[];
} = React.memo(props => <MuiPaper {...props} />);

JuiPaper.displayName = 'JuiPaper';
