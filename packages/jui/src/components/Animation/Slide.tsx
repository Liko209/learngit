/*
 * @Author: Wayne Zhou (wayne.zhou@ringcentral.com)
 * @Date: 2019-03-01 11:17:41
 * Copyright © RingCentral. All rights reserved.
 */

import React from 'react';
import { keyframes } from '../../foundation/styled-components';
import { TransitionAnimationProps } from './types';
import { JuiTransition } from './TransitionAnimation';

const animationSlideDown = keyframes`
    from {
      transform: translateY(-100%);
    }
    to {
      transform: translateY(0);
    }
`;

const animationSideUp = keyframes`
    from {
      transform: translateY(100%);
    }
    to {
      transform: translateY(0);
    }
`;

type SlideDirection = 'up' | 'down';
type JuiSlideProps = { direction?: SlideDirection } & TransitionAnimationProps;

const JuiSlide = React.memo(
  ({ direction = 'down', ...rest }: JuiSlideProps) => (
    <JuiTransition
      {...rest}
      animation={direction === 'down' ? animationSlideDown : animationSideUp}
    />
  ),
);

export { JuiSlide, JuiSlideProps };
