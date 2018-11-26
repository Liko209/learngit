/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-11-26 10:55:44
 * Copyright © RingCentral. All rights reserved.
 */

import { BaseError } from './BaseError';
import { ResultOk } from './ResultOk';
import { ResultErr } from './ResultErr';

function ok<T>(data: T): ResultOk<T, BaseError> {
  return new ResultOk(data);
}

function err<T, E extends BaseError = BaseError>(
  code: number,
  message?: string,
): ResultErr<T, E> {
  const msg = message || `Error: ${code}`;
  const error = new BaseError(code, msg) as E;
  return new ResultErr(error);
}

export { ok, err };
