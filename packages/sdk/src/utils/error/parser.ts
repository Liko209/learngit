/*
 * @Author: dennis.jiang (dennis.jiang@ringcentral.com)
 * @Date: 2018-03-22 13:29:51
 * Copyright © RingCentral. All rights reserved.
 */

// import _ from 'lodash';
import { BaseResponse, ERROR_TYPES } from 'foundation';
import {
  DBCriticalError,
  DBNeedRetryError,
  DBUnsupportedError,
} from '../../dao/errors/handler';
import { ERROR_CODES_SERVER, JServerError, JNetworkError, ERROR_CODES_NETWORK, JError, dbErrorParser } from '../../error';
// import BaseResponse from 'foundation/network/BaseResponse';

class ErrorParser {
  static parse(arg: any): JError {
    // Is BaseError, don't need parse
    if (arg instanceof JError) {
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
    return new JError(ERROR_TYPES.UNDEFINED, '', 'Undefined error!');
  }

  static parseApiError(resp: BaseResponse): JError {
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

      if (ERROR_CODES_SERVER[httpErrorCode.toUpperCase()]) {
        return new JServerError(httpErrorCode.toUpperCase(), httpErrorMessage);
      }
    }

    /**
     * From resp.statusText
     */
    if (statusText === 'Network Error') {
      return new JNetworkError(
        ERROR_CODES_NETWORK.NETWORK_ERROR,
        'Api Error: Please check whether server crash');
    }

    if (statusText === 'NOT NETWORK CONNECTION') {
      return new JNetworkError(
        ERROR_CODES_NETWORK.NOT_NETWORK,
        'Api Error: Please check network connection');
    }

    /**
     * From resp.status
     */
    if (Object.values(ERROR_CODES_NETWORK).includes(`HTTP_${status}`)) {
      return new JNetworkError(`HTTP_${status}`, '');
    }

    /**
     * Default Api error
     */
    return new JServerError(ERROR_CODES_SERVER.GENERAL, 'Api Error: Unknown error.');
  }

  static parseDBError(
    error: DBCriticalError | DBNeedRetryError | DBUnsupportedError,
  ) {

    return dbErrorParser.parse(error);
  }
}
export default ErrorParser;
