/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-11-26 10:55:44
 * Copyright © RingCentral. All rights reserved.
 */

import { ResultOk } from './ResultOk';
import { ResultErr } from './ResultErr';
import { JError } from '../error';

function ok<T>(data: T): ResultOk<T, JError> {
  return new ResultOk(data);
}

function err<E extends JError = JError>(
  error: JError,
): ResultErr<any, E> {
  return new ResultErr(error as E);
}

export { ok, err };
