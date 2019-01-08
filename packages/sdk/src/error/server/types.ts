/*
 * @Author: Paynter Chen
 * @Date: 2019-01-04 10:53:33
 * Copyright © RingCentral. All rights reserved.
 */
import { JError } from 'foundation';
import { ERROR_TYPES } from '../types';

export class JServerError extends JError {
  constructor(code: string, message: string, payload?: { [key: string]: string }) {
    super(ERROR_TYPES.SERVER, code, message, payload);
  }
}

export const ERROR_CODES_SERVER = {
  GENERAL: 'GENERAL',
  INVALID_GRANT: 'INVALID_GRANT',
  ALREADY_TAKEN: 'ALREADY_TAKEN',
  INVALID_FIELD: 'INVALID_FIELD',
  SYNTAX_ERROR: 'SYNTAX_ERROR',
  URI_ERROR: 'URI_ERROR',
};
