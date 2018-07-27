/*
 * @Author: dennis.jiang (dennis.jiang@ringcentral.com)
 * @Date: 2018-03-22 13:29:51
 * Copyright © RingCentral. All rights reserved.
 */

// import _ from 'lodash';
import Dexie from 'dexie';
import BaseError from './base';
import ErrorTypes from './types';

class ErrorParser {
  static parse(error: any) {
    if (error instanceof Dexie.DexieError) {
      return ErrorParser.dexie(error);
    } else if (error.response) {
      return ErrorParser.http(error);
    } else if (error.error && Object.prototype.toString.call(error.error) === '[object String]') {
      return new BaseError(ErrorTypes[error.error.toUpperCase()], error.error_description);
    }
    return new BaseError(ErrorTypes.UNDEFINED_ERROR, error.message);
  }

  static dexie(error: any) {
    return new BaseError(ErrorTypes.DB, error.message);
  }

  static http(error: any) {
    return new BaseError(error.response.status + ErrorTypes.HTTP, error.message);
  }
}
export default ErrorParser;
