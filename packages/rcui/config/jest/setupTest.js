/*
 * @Author: Wayne Zhou (wayne.zhou@ringcentral.com)
 * @Date: 2019-03-21 23:27:23
 * Copyright © RingCentral. All rights reserved.
 */

import themeHandler from '../../src/foundation/styles/ThemeHandler';
jest
  .spyOn(themeHandler, 'loadUrl')
  .mockImplementation(() => Promise.resolve(JSON.stringify({})));
import 'jest-styled-components';
import 'eventemitter2';
jest.mock('eventemitter2');
