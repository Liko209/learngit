/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-11-26 14:20:33
 * Copyright © RingCentral. All rights reserved.
 */

import { ResultOk, BaseError, ResultErr, BaseResponse } from 'foundation';
import { ErrorParser } from '../utils';

class NetworkResultOk<T, E extends BaseError = BaseError> extends ResultOk<
  T,
  E
> {
  readonly status: number;
  readonly headers: object;

  constructor(data: T, status: number, headers: object) {
    super(data);
    this.status = status;
    this.headers = headers;
  }
}

class NetworkResultErr<T, E extends BaseError = BaseError> extends ResultErr<
  T,
  E
> {
  readonly status: number;
  readonly headers: object;

  constructor(error: E, status: number, headers: object) {
    super(error);
    this.status = status;
    this.headers = headers;
  }
}

type NetworkResult<T, E extends BaseError = BaseError> =
  | NetworkResultOk<T, E>
  | NetworkResultErr<T, E>;

function networkOk<T>(
  data: T,
  status: number,
  headers: object,
): NetworkResultOk<T, BaseError> {
  return new NetworkResultOk(data, status, headers);
}

function networkErr<T, E extends BaseError = BaseError>(resp: BaseResponse) {
  const error = ErrorParser.parse(resp) as E;
  error.message = error.message || `Error: ${error.code}`;
  return new NetworkResultErr<T, E>(error, resp.status, resp.headers);
}

export {
  NetworkResult,
  NetworkResultOk,
  NetworkResultErr,
  networkOk,
  networkErr,
};
