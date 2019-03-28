/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-09-27 14:03:38
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import MuiCircularProgress, {
  CircularProgressProps as MuiCircularProgressProps,
} from '@material-ui/core/CircularProgress';
import styled from '../../foundation/styled-components';

type JuiCircularProgressProps = MuiCircularProgressProps;

const JuiCircularProgress = styled<JuiCircularProgressProps>(
  ({ ...rest }: JuiCircularProgressProps) => <MuiCircularProgress {...rest} />,
)``;

JuiCircularProgress.defaultProps = {
  size: 24,
};

JuiCircularProgress.displayName = 'JuiCircularProgress';

export { JuiCircularProgress, JuiCircularProgressProps };
