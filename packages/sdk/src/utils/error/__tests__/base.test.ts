import BaseError from '../base';

describe('baseError', () => {
  let baseError: BaseError;

  beforeEach(() => {
    baseError = new BaseError(1, 'undefined');
  });

  it('baseError new', () => {
    expect(baseError instanceof Error).toBe(true);
    expect(baseError.code).toBe(1);
    expect(baseError.message).not.toBeNull();
  });
});