/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2019-01-22 13:22:02
 * Copyright © RingCentral. All rights reserved.
 */
import { Palette } from '../theme/theme';
import { grey, palette } from './styles';

const getAccentColor = (
  customColor?: [keyof Palette, string],
  defaultColor?: any,
) => {
  return customColor
    ? palette(customColor[0], customColor[1])
    : defaultColor || grey('900');
};

export { getAccentColor };
