/*
 * @Author: dennis.jiang (dennis.jiang@ringcentral.com)
 * @Date: 2018-03-21 17:16:50
 * Copyright © RingCentral. All rights reserved.
 */

import notificationCenter from '../../service/notificationCenter';

import ErrorParser from './parser';
import { JSdkError } from '../../error';

if (typeof window !== 'undefined') {
  window.addEventListener('error', (err: any) => {
    notificationCenter.emit('Error', { error: ErrorParser.parse(err) });
  });
}

const Throw = (code: string, message: string) => {
  throw new JSdkError(code, message);
};

const Aware = (code: string, message: string) => {
  notificationCenter.emit('Error', { error: new JSdkError(code, message) });
};

export { ErrorParser, Throw, Aware };
