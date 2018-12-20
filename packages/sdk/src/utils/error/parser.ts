/*
 * @Author: dennis.jiang (dennis.jiang@ringcentral.com)
 * @Date: 2018-03-22 13:29:51
 * Copyright © RingCentral. All rights reserved.
 */

// import _ from 'lodash';
import { BaseResponse } from 'foundation';
import {
  DBCriticalError,
  DBNeedRetryError,
  DBUnsupportedError,
} from '../../dao/errors/handler';
import BaseError from './base';
import ErrorTypes from './types';
// import BaseResponse from 'foundation/network/BaseResponse';

class ErrorParser {
  static parse(arg: any): BaseError {
    // Is BaseError, don't need parse
    if (arg instanceof BaseError) {
      return arg;
    }

    // Is a response from network
    if (arg instanceof BaseResponse) {
      return ErrorParser.parseApiError(arg);
    }

    // Maybe DB error
    const parsedError = ErrorParser.parseDBError(arg);
    if (parsedError) return parsedError;

    // Unknown
    return new BaseError(ErrorTypes.UNDEFINED_ERROR, 'Undefined error!');
  }

  static parseApiError(resp: BaseResponse) {
    const { data, status, statusText } = resp;

    /**
     * From resp.data
     */
    if (data && data.error) {
      let httpErrorCode: string = '';
      let httpErrorMessage: string = '';

      if (typeof data.error === 'string') {
        httpErrorCode = data.error;
        httpErrorMessage = data.error_description;
      }

      if (
        typeof data.error === 'object' &&
        typeof data.error.code === 'string'
      ) {
        httpErrorCode = data.error.code;
        httpErrorMessage = data.error.message;
      }

      const code = ErrorTypes[`API_${httpErrorCode.toUpperCase()}`];

      if (code) {
        return new BaseError(code, httpErrorMessage);
      }
    }

    /**
     * From resp.statusText
     */
    if (statusText === 'Network Error') {
      return new BaseError(
        ErrorTypes.API_NETWORK,
        'Api Error: Please check whether server crash',
      );
    }

    if (statusText === 'NOT NETWORK CONNECTION') {
      return new BaseError(
        ErrorTypes.API_NETWORK,
        'Api Error: Please check network connection',
      );
    }

    /**
     * From resp.status
     */
    if (Object.values(ErrorTypes).includes(status + ErrorTypes.API)) {
      return new BaseError(status + ErrorTypes.API, '');
    }

    /**
     * Default Api error
     */
    return new BaseError(ErrorTypes.API, 'Api Error: Unknown error.');
  }

  static parseDBError(
    error: DBCriticalError | DBNeedRetryError | DBUnsupportedError,
  ) {
    if (error instanceof DBCriticalError) {
      return new BaseError(ErrorTypes.DB_CRITICAL_ERROR, error.message);
    }

    if (error instanceof DBNeedRetryError) {
      return new BaseError(ErrorTypes.DB_NEED_RETRY_ERROR, error.message);
    }

    if (error instanceof DBUnsupportedError) {
      return new BaseError(ErrorTypes.DB_UNSUPPORTED_ERROR, error.message);
    }

    return null;
  }
}
export default ErrorParser;
