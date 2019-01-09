/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-12-07 15:16:37
 * Copyright © RingCentral. All rights reserved.
 */
import { BaseResponse } from 'foundation';
import { ApiResultErr, ApiResultOk } from './ApiResult';
import { JError } from '../error';
import { responseParser } from './parser';

function apiOk<T>(resp: BaseResponse): ApiResultOk<T, JError> {
  return new ApiResultOk(resp.data, resp);
}

function apiErr<T, E extends JError = JError>(resp: BaseResponse) {
  const error = responseParser.parse(resp) as E;
  return new ApiResultErr<T, E>(error, resp);
}

export { apiOk, apiErr };
