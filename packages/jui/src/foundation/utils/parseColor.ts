/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-08-19 16:22:19
 * Copyright © RingCentral. All rights reserved.
 */
import { Palette } from '../theme/theme';

function parseColor(color?: string) {
  let scope: keyof Palette = 'primary';
  let name: string = 'main';
  if (color) {
    const array = color.split('.');
    if (array.length > 1) {
      scope = array[0] as keyof Palette;
      name = array[1];
    } else {
      scope = array[0] as keyof Palette;
      name = 'main';
    }
  }
  return { scope, name };
}

export { parseColor };
