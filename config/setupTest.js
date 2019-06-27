/*
 * @Author: wayne.zhou
 * @Date: 2019-05-08 23:01:16
 * Copyright © RingCentral. All rights reserved.
 */

import 'jest-styled-components';
import themeHandler from 'rcui/foundation/styles/ThemeHandler';
import light from './light.json';
jest
  .spyOn(themeHandler, 'loadUrl')
  .mockImplementation(() => Promise.resolve(light));
import 'jest-styled-components';
