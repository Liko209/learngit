/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-11-26 14:20:33
 * Copyright © RingCentral. All rights reserved.
 */
import { JError, ResultErr, ResultOk, BaseResponse } from 'foundation';

class ApiResultOk<T, E extends JError = JError> extends ResultOk<T, E> {
  readonly status: number;
  readonly headers: object;
  readonly response: BaseResponse;

  constructor(data: T, response: BaseResponse) {
    super(data);
    this.response = response;
    this.status = response.status;
    this.headers = response.headers;
  }
}

class ApiResultErr<T, E extends JError = JError> extends ResultErr<T, E> {
  readonly status: number;
  readonly headers: object;
  readonly response: BaseResponse;

  constructor(error: E, response: BaseResponse) {
    super(error);
    this.response = response;
    this.status = response.status;
    this.headers = response.headers;
  }
}

type ApiResult<T, E extends JError = JError> =
  | ApiResultOk<T, E>
  | ApiResultErr<T, E>;

export { ApiResult, ApiResultOk, ApiResultErr };
