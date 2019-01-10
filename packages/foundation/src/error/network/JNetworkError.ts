/*
 * @Author: Paynter Chen
 * @Date: 2019-01-08 13:03:51
 * Copyright © RingCentral. All rights reserved.
 */

import { ERROR_TYPES } from '../types';
import { JError } from '../JError';

export class JNetworkError extends JError {
  constructor(code: string, message: string, payload?: { [key: string]: string }) {
    super(ERROR_TYPES.NETWORK, code, message, payload);
  }
}
