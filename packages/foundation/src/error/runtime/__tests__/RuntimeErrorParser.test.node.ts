/*
 * @Author: Paynter Chen
 * @Date: 2019-01-08 13:17:12
 * Copyright © RingCentral. All rights reserved.
 */
import { RuntimeErrorParser } from '../RuntimeErrorParser';
import { JRuntimeError } from '../JRuntimeError';
import { ERROR_CODES_RUNTIME } from '../types';

describe('RuntimeErrorParser', () => {
  describe('parse()', () => {
    const parser = new RuntimeErrorParser();
    it('should parse runtime error', () => {
      expect(parser.parse(new TypeError('test'))).toEqual(new JRuntimeError(ERROR_CODES_RUNTIME.TYPE_ERROR, 'test'));
      expect(parser.parse(new EvalError('test'))).toEqual(new JRuntimeError(ERROR_CODES_RUNTIME.EVAL_ERROR, 'test'));
      expect(parser.parse(new RangeError('test'))).toEqual(new JRuntimeError(ERROR_CODES_RUNTIME.RANGE_ERROR, 'test'));
      expect(parser.parse(new ReferenceError('test'))).toEqual(new JRuntimeError(ERROR_CODES_RUNTIME.REFERENCE_ERROR, 'test'));
      expect(parser.parse(new SyntaxError('test'))).toEqual(new JRuntimeError(ERROR_CODES_RUNTIME.SYNTAX_ERROR, 'test'));
      expect(parser.parse(new URIError('test'))).toEqual(new JRuntimeError(ERROR_CODES_RUNTIME.URI_ERROR, 'test'));
    });
    it('should not parse other error', () => {
      expect(parser.parse(new Error('test'))).toBeNull();
    });
  });
});
