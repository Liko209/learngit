/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-09-27 14:03:38
 * Copyright © RingCentral. All rights reserved.
 */

import React from 'react';
import MuiLinearProgress, {
  LinearProgressProps as MuiLinearProgressProps,
} from '@material-ui/core/LinearProgress';
import styled from '../../foundation/styled-components';
import { Omit } from '../../foundation/utils/typeHelper';

type RuiLinearProgressProps = Omit<MuiLinearProgressProps, 'innerRef'> &
  React.HTMLAttributes<HTMLHRElement>;

const RuiLinearProgress = styled(MuiLinearProgress)``;

RuiLinearProgress.displayName = 'RuiLinearProgress';

export { RuiLinearProgress, RuiLinearProgressProps };
