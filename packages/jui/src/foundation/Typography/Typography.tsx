/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-09-27 16:11:55
 * Copyright © RingCentral. All rights reserved.
 */

import * as React from 'react';
import MuiTypography, {
  TypographyProps as MuiTypographyProps,
} from '@material-ui/core/Typography';

type JuiTypographyProps = MuiTypographyProps;

const JuiTypography: React.SFC<JuiTypographyProps> & {
  dependencies?: any[];
} = React.memo(props => <MuiTypography {...props} />);

JuiTypography.displayName = 'MuiTypography';
JuiTypography.dependencies = [MuiTypography];

export { JuiTypographyProps, JuiTypography };
