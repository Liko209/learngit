/*
 * @Author: Wayne Zhou (wayne.zhou@ringcentral.com)
 * @Date: 2019-03-01 11:18:22
 * Copyright © RingCentral. All rights reserved.
 */

import * as React from 'react';
import styled from '../../foundation/styled-components';
import { TransitionProps } from 'react-transition-group/Transition';
import { Transition } from 'react-transition-group';

const Wrapper = styled(Transition)`
  height: 100%;
  background: transparent;
  && > * {
    background: transparent;
  }
`;

const JuiDialogOpenTransition = React.forwardRef(
  (
    {
      mountOnEnter,
      unmountOnExit,
      timeout,
      addEndListener,
      onEnter,
      onEntering,
      onEntered,
      onExit,
      onExiting,
      onExited,
      ...rest
    }: TransitionProps,
    ref,
  ) => {
    delete rest.in;
    return <Wrapper ref={ref as any} timeout={0} {...rest} />;
  },
);

export { JuiDialogOpenTransition };
