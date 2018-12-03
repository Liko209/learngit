/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-11-26 10:33:13
 * Copyright © RingCentral. All rights reserved.
 */

enum ResultType {
  Ok = 'Ok',
  Err = 'Err',
}

type ResultCases<T, E, R1, R2> = {
  Ok: (data: T) => R1;
  Err: (error: E) => R2;
};

export { ResultType, ResultCases };
