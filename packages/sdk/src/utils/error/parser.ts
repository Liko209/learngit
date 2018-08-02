/*
 * @Author: dennis.jiang (dennis.jiang@ringcentral.com)
 * @Date: 2018-03-22 13:29:51
 * Copyright © RingCentral. All rights reserved.
 */

// import _ from 'lodash';
import Dexie from 'dexie';
import BaseError from './base';
import ErrorTypes from './types';
import { Response } from 'foundation';
// import BaseResponse from 'foundation/network/BaseResponse';

class ErrorParser {
  static parse(err: any) {
    // need refactor
    // if (!err) return new BaseError(ErrorTypes.UNDEFINED_ERROR, 'Server Crash');

    if (err instanceof Dexie.DexieError) {
      return ErrorParser.dexie(err);
    } else if (err instanceof Response) {
      return ErrorParser.http(err);
    }
    return new BaseError(ErrorTypes.UNDEFINED_ERROR, 'Undefined error!');
  }

  static dexie(err: any) {
    return new BaseError(ErrorTypes.DB, err.message);
  }

  static http(err: any) {
    if (err.statusText === 'Network Error') {
      return new BaseError(ErrorTypes.NETWORK, 'Network Error: Please check whether server crash');
    }

    if (err.statusText === 'NOT NETWORK CONNECTION') {
      return new BaseError(ErrorTypes.NETWORK, 'Network Error: Please check network connection');
    }

    const { data } = err;

    if (typeof data.error === 'string') {
      return new BaseError(ErrorTypes[data.error.toUpperCase()], data.error_description);
    }

    return new BaseError(err.status + ErrorTypes.HTTP, data.error.message);
  }
}
export default ErrorParser;
