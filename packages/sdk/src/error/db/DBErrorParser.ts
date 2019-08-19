import { JError, IErrorParser } from 'foundation/error';
import {
  DBCriticalError,
  DBNeedRetryError,
  DBUnsupportedError,
  DBInvalidUsageError,
  DBError,
} from '../../framework/dao/errors/handler';
import { ERROR_CODES_DB } from './types';
import { JDBError } from './JDBError';

export class DBErrorParser implements IErrorParser {
  getName() {
    return 'DBErrorParser';
  }

  parse(error: Error): JError | null {
    if (error instanceof DBCriticalError) {
      return new JDBError(ERROR_CODES_DB.CRITICAL_ERROR, error.message);
    }
    if (error instanceof DBNeedRetryError) {
      return new JDBError(ERROR_CODES_DB.NEED_RETRY, error.message);
    }
    if (error instanceof DBUnsupportedError) {
      return new JDBError(ERROR_CODES_DB.UN_SUPPORTED, error.message);
    }
    if (error instanceof DBInvalidUsageError) {
      return new JDBError(ERROR_CODES_DB.INVALID_USAGE_ERROR, error.message);
    }
    if (error instanceof DBError) {
      return new JDBError(ERROR_CODES_DB.GENERAL, error.message);
    }
    return null;
  }
}
