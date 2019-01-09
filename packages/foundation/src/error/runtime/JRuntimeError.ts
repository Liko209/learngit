/*
 * @Author: Paynter Chen
 * @Date: 2019-01-08 13:12:45
 * Copyright © RingCentral. All rights reserved.
 */
import { JError } from '../JError';
import { ERROR_TYPES } from '../types';

export class JRuntimeError extends JError {
  constructor(code: string, message: string, payload?: { [key: string]: string }) {
    super(ERROR_TYPES.RUNTIME, code, message, payload);
  }
}
