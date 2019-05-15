/*
 * @Author: Wayne Zhou (wayne.zhou@ringcentral.com)
 * @Date: 2019-03-21 23:27:23
 * Copyright © RingCentral. All rights reserved.
 */

import themeHandler from 'rcui/foundation/styles/ThemeHandler';
import light from './light.json';
jest
  .spyOn(themeHandler, 'loadUrl')
  .mockImplementation(() => Promise.resolve(light));
import 'jest-styled-components';

// jest.spyOn(global, 'fetch').mockImplementation(() => ({}));
// global.fetch = () => Promise.resolve(light);
