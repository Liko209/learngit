/*
 * @Author: Paynter Chen
 * @Date: 2019-01-08 13:12:50
 * Copyright © RingCentral. All rights reserved.
 */

import { ERROR_CODES_RUNTIME } from './types';
import { JRuntimeError } from './JRuntimeError';
import { JError } from '../JError';
import { AbstractErrorParser } from '../AbstractErrorParser';

export class RuntimeErrorParser extends AbstractErrorParser {

  constructor() {
    super('RuntimeErrorParser');
  }

  parse(error: Error): JError | null {
    if (error instanceof TypeError) return new JRuntimeError(ERROR_CODES_RUNTIME.TYPE_ERROR, error.message);
    if (error instanceof EvalError) return new JRuntimeError(ERROR_CODES_RUNTIME.EVAL_ERROR, error.message);
    if (error instanceof RangeError) return new JRuntimeError(ERROR_CODES_RUNTIME.RANGE_ERROR, error.message);
    if (error instanceof ReferenceError) return new JRuntimeError(ERROR_CODES_RUNTIME.REFERENCE_ERROR, error.message);
    if (error instanceof SyntaxError) return new JRuntimeError(ERROR_CODES_RUNTIME.SYNTAX_ERROR, error.message);
    if (error instanceof URIError) return new JRuntimeError(ERROR_CODES_RUNTIME.URI_ERROR, error.message);
    return null;
  }
}
