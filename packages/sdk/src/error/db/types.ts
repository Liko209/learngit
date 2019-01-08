/*
 * @Author: Paynter Chen
 * @Date: 2019-01-04 10:53:21
 * Copyright © RingCentral. All rights reserved.
 */
import { JError, IErrorParser, errorParser } from 'foundation';
import { DBCriticalError, DBNeedRetryError, DBUnsupportedError, DBInvalidUsageError, DBError } from '../../dao/errors/handler';

import { ERROR_TYPES } from '../types';

export class JDBError extends JError {
  constructor(code: string, message: string, payload?: { [key: string]: string }) {
    super(ERROR_TYPES.DB, code, message, payload);
  }
}

export const ERROR_CODES_DB = {
  GENERAL: 'GENERAL_ERROR',
  CRITICAL_ERROR: 'CRITICAL_ERROR',
  NEED_RETRY: 'NEED_RETRY',
  UN_SUPPORTED: 'UN_SUPPORTED',
  INVALID_USAGE_ERROR: 'INVALID_USAGE_ERROR',
};

class DBErrorParser implements IErrorParser {
  name = 'DBErrorParser';
  parse(error: Error): JError | null {
    if (error instanceof DBCriticalError) return new JDBError(ERROR_CODES_DB.CRITICAL_ERROR, error.message);
    if (error instanceof DBNeedRetryError) return new JDBError(ERROR_CODES_DB.NEED_RETRY, error.message);
    if (error instanceof DBUnsupportedError) return new JDBError(ERROR_CODES_DB.UN_SUPPORTED, error.message);
    if (error instanceof DBInvalidUsageError) return new JDBError(ERROR_CODES_DB.INVALID_USAGE_ERROR, error.message);
    if (error instanceof DBError) return new JDBError(ERROR_CODES_DB.GENERAL, error.message);
    return null;
  }
}

const dbErrorParser = new DBErrorParser();
errorParser.register(dbErrorParser);
export {
  dbErrorParser,
};
