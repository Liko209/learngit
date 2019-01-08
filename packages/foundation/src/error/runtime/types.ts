/*
 * @Author: Paynter Chen
 * @Date: 2019-01-04 10:54:04
 * Copyright © RingCentral. All rights reserved.
 */
import { JError, ERROR_TYPES, IErrorParser } from '../types';

export class JRuntimeError extends JError {
  constructor(code: string, message: string, payload?: { [key: string]: string }) {
    super(ERROR_TYPES.RUNTIME, code, message, payload);
  }
}

export const ERROR_CODES_RUNTIME = {
  TYPE_ERROR: 'TYPE_ERROR',
  EVAL_ERROR: 'EVAL_ERROR',
  RANGE_ERROR: 'RANGE_ERROR',
  REFERENCE_ERROR: 'REFERENCE_ERROR',
  SYNTAX_ERROR: 'SYNTAX_ERROR',
  URI_ERROR: 'URI_ERROR',
};

class RuntimeErrorParser implements IErrorParser {
  name = 'RuntimeErrorParser';
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
const runtimeErrorParser = new RuntimeErrorParser();
export {
  runtimeErrorParser,
};
