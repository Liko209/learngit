/*
 * @Author: dennis.jiang (dennis.jiang@ringcentral.com)
 * @Date: 2018-03-21 17:16:50
 * Copyright © RingCentral. All rights reserved.
 */

import notificationCenter from '../../service/notificationCenter';

import BaseError from './base';
import ErrorTypes from './types';
import ErrorParser from './parser';

window.addEventListener('error', (err: any) => {
  notificationCenter.emit('Error', { error: ErrorParser.parse(err) });
});

const Throw = (code: number, message: string) => {
  throw new BaseError(code, message);
};

const Aware = (code: number, message: string) => {
  notificationCenter.emit('Error', { error: new BaseError(code, message) });
};

export {
  BaseError,
  ErrorTypes,
  ErrorParser,
  Throw,
  Aware
};
