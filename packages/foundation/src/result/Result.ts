/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-11-26 10:34:02
 * Copyright © RingCentral. All rights reserved.
 */

import { BaseError } from './BaseError';
import { ResultOk } from './ResultOk';
import { ResultErr } from './ResultErr';
import { ResultType, Cases } from './types';

abstract class Result<T, E extends BaseError = BaseError> {
  type: ResultType;

  constructor(type: ResultType) {
    this.type = type;
  }

  isOk(this: Result<T, E>): this is ResultOk<T, E> {
    return false;
  }

  isErr(): this is ResultErr<T, E> {
    return false;
  }

  abstract match<R1, R2>(cases: Cases<T, E, R1, R2>): R1 | R2;
  abstract unwrap(def?: T): T;
  abstract expect(message: string): T;
}

export { Result };
