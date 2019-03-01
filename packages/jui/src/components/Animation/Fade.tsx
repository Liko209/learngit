import * as React from 'react';
import { keyframes } from '../../foundation/styled-components';
import { TransitionAnimationProps } from './types';
import { JuiTransition } from './TransitionAnimation';

const fadeAnimation = keyframes`
    from {
      opacity: 0;
    }
    to {
      transform: opacity: 1;
    }
`;

const Fade = React.memo((props: TransitionAnimationProps) => (
  <JuiTransition {...props} animation={fadeAnimation} />
));

export { Fade };
