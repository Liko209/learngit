/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-11-26 14:20:33
 * Copyright © RingCentral. All rights reserved.
 */
import { BaseError, ResultErr, ResultOk } from 'foundation';

class ApiResultOk<T, E extends BaseError = BaseError> extends ResultOk<T, E> {
  readonly status: number;
  readonly headers: object;

  constructor(data: T, status: number, headers: object) {
    super(data);
    this.status = status;
    this.headers = headers;
  }
}

class ApiResultErr<T, E extends BaseError = BaseError> extends ResultErr<T, E> {
  readonly status: number;
  readonly headers: object;

  constructor(error: E, status: number, headers: object) {
    super(error);
    this.status = status;
    this.headers = headers;
  }
}

type ApiResult<T, E extends BaseError = BaseError> =
  | ApiResultOk<T, E>
  | ApiResultErr<T, E>;

export { ApiResult, ApiResultOk, ApiResultErr };
