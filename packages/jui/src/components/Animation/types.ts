/*
 * @Author: Wayne Zhou (wayne.zhou@ringcentral.com)
 * @Date: 2019-03-01 11:18:15
 * Copyright © RingCentral. All rights reserved.
 */

import { TransitionProps } from 'react-transition-group/Transition';
import { Omit } from '../../foundation/utils/typeHelper';
export type AnimationOptions = {
  duration: string;
  easing: string;
};

export type TransitionAnimationProps = {
  children: React.ReactNode;
  show: boolean;
  duration: string;
  easing: string;
} & Omit<TransitionProps, 'timeout'>;
