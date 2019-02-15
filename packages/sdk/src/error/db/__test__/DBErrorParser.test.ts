/*
 * @Author: Paynter Chen
 * @Date: 2019-01-08 14:35:46
 * Copyright © RingCentral. All rights reserved.
 */
import { DBErrorParser } from '../DBErrorParser';
import { JDBError } from '../JDBError';
import { ERROR_CODES_DB } from '../types';
import {
  DBCriticalError,
  DBNeedRetryError,
  DBUnsupportedError,
  DBInvalidUsageError,
  DBError,
} from '../../../framework/dao/errors/handler';

describe('DBErrorParser', () => {
  describe('parse()', () => {
    const parser = new DBErrorParser();
    it('should parse DB error', () => {
      expect(parser.parse(new DBCriticalError('test'))).toEqual(
        new JDBError(ERROR_CODES_DB.CRITICAL_ERROR, 'test'),
      );
      expect(parser.parse(new DBNeedRetryError('test'))).toEqual(
        new JDBError(ERROR_CODES_DB.NEED_RETRY, 'test'),
      );
      expect(parser.parse(new DBUnsupportedError('test'))).toEqual(
        new JDBError(ERROR_CODES_DB.UN_SUPPORTED, 'test'),
      );
      expect(parser.parse(new DBInvalidUsageError('test'))).toEqual(
        new JDBError(ERROR_CODES_DB.INVALID_USAGE_ERROR, 'test'),
      );
      expect(parser.parse(new DBError('test'))).toEqual(
        new JDBError(ERROR_CODES_DB.GENERAL, 'test'),
      );
    });
    it('should not parse other error', () => {
      expect(parser.parse(new Error('test'))).toBeNull();
    });
  });
});
