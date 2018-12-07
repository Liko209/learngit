/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-12-07 15:16:37
 * Copyright © RingCentral. All rights reserved.
 */
import { BaseResponse } from 'foundation';

import { BaseError, ErrorParser } from '../utils/error';
import { ApiResultErr, ApiResultOk } from './ApiResult';

function apiOk<T>(
  data: T,
  status: number,
  headers: object,
): ApiResultOk<T, BaseError> {
  return new ApiResultOk(data, status, headers);
}

function apiErr<T, E extends BaseError = BaseError>(resp: BaseResponse) {
  const error = ErrorParser.parse(resp) as E;
  error.message = error.message || `Error: ${error.code}`;
  return new ApiResultErr<T, E>(error, resp.status, resp.headers);
}

export { apiOk, apiErr };
