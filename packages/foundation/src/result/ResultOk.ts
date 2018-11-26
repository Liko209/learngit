/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-11-26 10:35:09
 * Copyright © RingCentral. All rights reserved.
 */

import { Result } from './Result';
import { BaseError } from './BaseError';
import { ResultType, Cases } from './types';

class ResultOk<T, E extends BaseError = BaseError> extends Result<T, E> {
  readonly data: T;

  constructor(data: T) {
    super(ResultType.Ok);
    this.data = data;
  }

  isOk(this: Result<T, E>): this is ResultOk<T, E> {
    return true;
  }

  match<R1, R2>(cases: Cases<T, E, R1, R2>): R1 | R2 {
    return cases.Ok(this.data);
  }

  unwrap(): T {
    return this.data;
  }

  expect() {
    return this.data;
  }
}

export { ResultOk };
