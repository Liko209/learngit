/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-11-26 10:52:44
 * Copyright © RingCentral. All rights reserved.
 */

import { Result } from './Result';
import { ResultType, ResultCases } from './types';
import { JError } from '../error';

class ResultErr<T, E extends JError = JError> extends Result<T, E> {
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
    if (message) {
      this.error.message = message;
    }
    throw this.error;
  }
}

export { ResultErr };
