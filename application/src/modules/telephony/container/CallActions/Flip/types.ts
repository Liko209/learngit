/*
 * @Author: Jeffrey Huang
 * @Date: 2019-05-30 18:46:01
 * Copyright © RingCentral. All rights reserved.
 */

import { ForwardingFlipNumberModel } from 'sdk/module/rcInfo';

type FlipProps = {};

type FlipViewProps = {
  canUseFlip: boolean;
  flipNumbers: ForwardingFlipNumberModel[];
  flip: (flipNumber: number) => void;
};

export { FlipProps, FlipViewProps };
