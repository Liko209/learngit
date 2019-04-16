/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-04-10 11:22:32
 * Copyright © RingCentral. All rights reserved.
 */
type IconPosition = 'left' | 'right' | 'both';

type InputRadius = {
  circle: string; // half of height
  rounded: string; // 4px
  rectangle: number; // 0px
};

type InputRadiusKeys = keyof InputRadius;

type OutlineTextSize = 'small' | 'medium' | 'large';

export { IconPosition, InputRadius, InputRadiusKeys, OutlineTextSize };
