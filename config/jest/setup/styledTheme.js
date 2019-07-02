/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-06-27 09:39:58
 * Copyright © RingCentral. All rights reserved.
 */
import 'jest-styled-components';
import moment from 'moment';
import themeHandler from 'rcui/foundation/styles/ThemeHandler';
import light from './light.json';
jest
  .spyOn(themeHandler, 'loadUrl')
  .mockImplementation(() => Promise.resolve(light));

const originalFormat = moment.prototype.format;
moment.prototype.format = function (format) {
  const utcOffset = new Date().getTimezoneOffset();
  this.utcOffset(-utcOffset);
  return originalFormat.call(this, format);
};
