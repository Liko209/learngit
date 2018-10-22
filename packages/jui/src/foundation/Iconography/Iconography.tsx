/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-08-17 10:37:05
 * Copyright © RingCentral. All rights reserved.
 */
import * as React from 'react';
import MuiIcon, { IconProps as MuiIconProps } from '@material-ui/core/Icon';

type JuiIconographyProps = MuiIconProps;

export const JuiIconography: React.SFC<JuiIconographyProps> & {
  dependencies?: any[];
} = props => <MuiIcon {...props} />;

JuiIconography.displayName = 'JuiIconography';
JuiIconography.dependencies = [MuiIcon];
