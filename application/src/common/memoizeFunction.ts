/*
 * @Author: Wayne Zhou (wayne.zhou@ringcentral.com)
 * @Date: 2019-03-18 10:42:06
 * Copyright © RingCentral. All rights reserved.
 */
import moize from 'moize';
import { Palette } from 'jui/foundation/theme/theme';
import { IconColor } from 'jui/foundation/Iconography';

const memoizeColor = moize(
  (scope: keyof Palette, name: string): IconColor => [scope, name],
);

export { memoizeColor };
