/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-12-07 15:16:37
 * Copyright © RingCentral. All rights reserved.
 */
import { BaseResponse } from 'foundation';

import { BaseError, ErrorParser } from '../utils/error';
import { ApiResultErr, ApiResultOk } from './ApiResult';

function apiOk<T>(resp: BaseResponse): ApiResultOk<T, BaseError> {
  return new ApiResultOk(resp.data, resp);
}

function apiErr<T, E extends BaseError = BaseError>(resp: BaseResponse) {
  const error = ErrorParser.parseApiError(resp) as E;
  return new ApiResultErr<T, E>(error, resp);
}

export { apiOk, apiErr };
