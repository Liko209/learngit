/*
 * @Author: dennis.jiang (dennis.jiang@ringcentral.com)
 * @Date: 2018-03-22 13:29:51
 * Copyright © RingCentral. All rights reserved.
 */

// import _ from 'lodash';
import BaseError from './base';
import ErrorTypes, { ApiErrorTypes } from './types';
import { BaseResponse } from 'foundation';
import {
  DBCriticalError,
  DBNeedRetryError,
  DBUnsupportedError,
} from '../../dao/errors/handler';
// import BaseResponse from 'foundation/network/BaseResponse';

class ErrorParser {
  static parse(err: any): BaseError {
    // need refactor ** +1
    // if (!err) return new BaseError(ErrorTypes.UNDEFINED_ERROR, 'Server Crash');
    if (err instanceof BaseError) {
      return err;
    }
    if (err instanceof DBCriticalError) {
      return new BaseError(ErrorTypes.DB_CRITICAL_ERROR, err.message);
    }
    if (err instanceof DBNeedRetryError) {
      return new BaseError(ErrorTypes.DB_NEED_RETRY_ERROR, err.message);
    }
    if (err instanceof DBUnsupportedError) {
      return new BaseError(ErrorTypes.DB_UNSUPPORTED_ERROR, err.message);
    }

    if (err instanceof BaseResponse) {
      return ErrorParser.http(err);
    }

    if (err.status) {
      return ErrorParser.iResponse(err);
    }

    return new BaseError(ErrorTypes.UNDEFINED_ERROR, 'Undefined error!');
  }

  static iResponse(err: any) {
    return new BaseError(err.status + ErrorTypes.HTTP, err.message || '');
  }

  static http(err: any) {
    if (err.statusText === 'Network Error') {
      return new BaseError(
        ErrorTypes.NETWORK,
        'Network Error: Please check whether server crash',
      );
    }

    if (err.statusText === 'NOT NETWORK CONNECTION') {
      return new BaseError(
        ErrorTypes.NETWORK,
        'Network Error: Please check network connection',
      );
    }

    const { data } = err;

    if (typeof data.error === 'string') {
      return new BaseError(
        ErrorTypes[data.error.toUpperCase()],
        data.error_description,
      );
    }

    if (typeof data.error === 'object' && typeof data.error.code === 'string') {
      return new BaseError(
        ApiErrorTypes[data.error.code.toUpperCase()],
        data.error.message,
      );
    }

    return err;
  }
}
export default ErrorParser;
