/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-06-27 09:39:58
 * Copyright © RingCentral. All rights reserved.
 */
import 'jest-styled-components';
import themeHandler from 'rcui/foundation/styles/ThemeHandler';
import light from './light.json';
jest
  .spyOn(themeHandler, 'loadUrl')
  .mockImplementation(() => Promise.resolve(light));
