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

export type ShrinkToFadeAnimationProps = {
  in: boolean;
  children: JSX.Element | (JSX.Element | null)[];
  startMinimizeAnimation: boolean;
  xScale: string;
  yScale: string;
  translateX: number;
  translateY: number;
  onAnimationEnd?: () => any;
  expandScale?: number;
  fadeDuration?: string;
  moveDuration?: string;
  roundDuration?: string;
  blinkDuration?: string;
  moveDelay?: string;
  blinkDelay?: string;
  setRef?: (ref: React.RefObject<any>) => any;
  removeRef?: () => void;
};
