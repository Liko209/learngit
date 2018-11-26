/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-11-26 10:52:44
 * Copyright © RingCentral. All rights reserved.
 */

import { Result } from './Result';
import { BaseError } from './BaseError';
import { ResultType, ResultCases } from './types';

class ResultErr<T, E extends BaseError = BaseError> extends Result<T, E> {
  readonly error: E;

  constructor(error: E) {
    super(ResultType.Err);
    this.error = error;
  }

  isErr() {
    return true;
  }

  match<R1, R2>(cases: ResultCases<T, E, R1, R2>): R1 | R2 {
    return cases.Err(this.error);
  }

  unwrap(def?: T): T {
    if (def) {
      return def;
    }
    throw this.error;
  }

  expect(message: string): T {
    throw new BaseError(this.error.code, message);
  }
}

export { ResultErr };
