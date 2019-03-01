/*
 * @Author: Wayne Zhou (wayne.zhou@ringcentral.com)
 * @Date: 2019-03-01 11:17:41
 * Copyright © RingCentral. All rights reserved.
 */

import * as React from 'react';
import { keyframes } from '../../foundation/styled-components';
import { TransitionAnimationProps } from './types';
import { JuiTransition } from './TransitionAnimation';

const slideAnimation = keyframes`
    from {
      transform: translateY(-100%)
    }
    to {
      transform: translateY(0)
    }
`;

const JuiSlide = React.memo((props: TransitionAnimationProps) => (
  <JuiTransition {...props} animation={slideAnimation} />
));

export { JuiSlide };
