/*
 * @Author: Wayne Zhou (wayne.zhou@ringcentral.com)
 * @Date: 2019-03-01 11:17:59
 * Copyright © RingCentral. All rights reserved.
 */

import * as React from 'react';
import { keyframes } from '../../foundation/styled-components';
import { TransitionAnimationProps } from './types';
import { JuiTransition } from './TransitionAnimation';

const fadeAnimation = keyframes`
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
`;

const JuiFade = React.memo((props: TransitionAnimationProps) => (
  <JuiTransition {...props} animation={fadeAnimation} />
));

export { JuiFade };
