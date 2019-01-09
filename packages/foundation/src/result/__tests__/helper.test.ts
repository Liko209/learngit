/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-11-26 11:59:37
 * Copyright © RingCentral. All rights reserved.
 */

import { ok, err } from '../helper';
import { ResultOk } from '../ResultOk';
import { ResultErr } from '../ResultErr';
import { JError } from '../../error';

describe('ok()', () => {
  it('should create a ResultOk', () => {
    const result = ok('data');
    expect(result).toBeInstanceOf(ResultOk);
    expect(result.data).toBe('data');
  });
});

describe('err()', () => {
  it('should create a ResultErr', () => {
    const TYPE = '1';
    const CODE = '1';
    const MESSAGE = 'Something wrong happened.';

    const result = err(new JError(TYPE, CODE, MESSAGE));

    expect(result).toBeInstanceOf(ResultErr);
    expect(result.error.type).toBe(TYPE);
    expect(result.error.code).toBe(CODE);
    expect(result.error.message).toBe(MESSAGE);
  });

  it('should use default message', () => {
    const TYPE = '1';
    const CODE = '1';
    const MESSAGE = undefined;

    const result = err(new JError(TYPE, CODE, MESSAGE));

    expect(result).toBeInstanceOf(ResultErr);
    expect(result.error.type).toBe(TYPE);
    expect(result.error.code).toBe(CODE);
    expect(result.error.message).toBe('');
  });
});
