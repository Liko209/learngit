/*
 * @Author: Wayne Zhou (wayne.zhou@ringcentral.com)
 * @Date: 2019-03-01 11:18:22
 * Copyright © RingCentral. All rights reserved.
 */

import * as React from 'react';
import styled from '../../foundation/styled-components';
import { TransitionProps } from 'react-transition-group/Transition';

const Wrapper = styled.div`
  height: 100%;
`;

const JuiDialogOpenTransition = ({
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
}: TransitionProps) => {
  delete rest.in;
  return <Wrapper {...rest} />;
};

export { JuiDialogOpenTransition };
