/*
 * @Author: dennis.jiang (dennis.jiang@ringcentral.com)
 * @Date: 2018-03-21 17:16:50
 * Copyright © RingCentral. All rights reserved.
 */

import notificationCenter from '../../service/notificationCenter';

import { JSdkError } from '../../error';

const Throw = (code: string, message: string) => {
  throw new JSdkError(code, message);
};

const Aware = (code: string, message: string) => {
  notificationCenter.emit('Error', { error: new JSdkError(code, message) });
};

export { Throw, Aware };
