import ErrorTypes from '../types';
import * as HttpStatus from 'http-status-codes';

describe('ErrorTypes', () => {

  const types: any = ErrorTypes;

  beforeEach(() => {
    Object.keys(HttpStatus).forEach((key: string) => {
      types[key] = ErrorTypes.HTTP + HttpStatus[key];
    });
  });
  it('HTTP ACCEPTED code is 1202', () => {
    expect(types.ACCEPTED).toBe(1202);
  });

  it('HTTP USE_PROXY code is 1305', () => {
    expect(types.USE_PROXY).toBe(1305);
  });

  it('HTTP INVALIDTE_PARAMETERS code is 3001', () => {
    expect(types.INVALIDTE_PARAMETERS).toBe(3001);
  });
});
