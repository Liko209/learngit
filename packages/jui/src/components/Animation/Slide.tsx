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

const Slide = React.memo((props: TransitionAnimationProps) => (
  <JuiTransition {...props} animation={slideAnimation} />
));

export { Slide };
