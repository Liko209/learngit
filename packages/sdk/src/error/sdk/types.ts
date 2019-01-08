/*
 * @Author: Paynter Chen
 * @Date: 2019-01-04 10:53:28
 * Copyright © RingCentral. All rights reserved.
 */
import { JError } from 'foundation';
import { ERROR_TYPES } from '../types';

export class JSdkError extends JError {
  constructor(code: string, message: string, payload?: { [key: string]: string }) {
    super(ERROR_TYPES.SDK, code, message, payload);
  }
}

export const ERROR_CODES_SDK = {
  GENERAL: 'GENERAL_ERROR',
  // OAUTH
  OAUTH: 'OAUTH',
  OAUTH_INVALID_GRANT: 'OAUTH_INVALID_GRANT',
  // Invalid Parameter
  INVALID_FIELD: 'INVALID_FIELD',
  INVALID_MODEL_ID: 'INVALID_MODEL_ID',
  ALREADY_TAKEN: 'ALREADY_TAKEN',
  // API
  API_CONFIG_ERROR: 'API_CONFIG_ERROR',
  API_NOT_INITIALIZED: 'API_NOT_INITIALIZED',
};
