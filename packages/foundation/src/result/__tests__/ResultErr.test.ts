/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-11-26 11:04:17
 * Copyright © RingCentral. All rights reserved.
 */

import { ResultErr } from '../ResultErr';
import { JError } from '../../error';

function setup() {
  const error = new JError('1', '1', 'Something wrong happened.');
  const result = new ResultErr(error);
  return { error, result };
}

describe('ResultErr', () => {
  describe('constructor()', () => {
    it('should store error', () => {
      const { error, result } = setup();
      expect(result.error).toBe(error);
    });
  });

  describe('match()', () => {
    it('should match ok case', () => {
      const { error, result } = setup();

      const cases = {
        Ok: jest.fn().mockName('Ok()'),
        Err: jest.fn().mockName('Err()'),
      };

      result.match(cases);

      expect(cases.Err).toHaveBeenCalledWith(error);
      expect(cases.Ok).not.toHaveBeenCalled();
    });
  });

  describe('unwrap()', () => {
    it('should throw error', () => {
      const { error, result } = setup();

      expect(() => result.unwrap()).toThrowError(error);
    });

    it('should return default data', () => {
      const DEFAULT = 'I am default data';
      const { result } = setup();

      expect(result.unwrap(DEFAULT)).toBe(DEFAULT);
    });
  });

  describe('expect()', () => {
    it('should throw error while have new error message', () => {
      const { result } = setup();

      expect(() => result.expect('New message')).toThrowError('New message');
    });
  });

  describe('isOk()', () => {
    it('should be truthy', () => {
      const { result } = setup();

      expect(result.isOk()).toBeFalsy();
    });
  });

  describe('isErr()', () => {
    it('should be falsy', () => { });
    const { result } = setup();

    expect(result.isErr()).toBeTruthy();
  });
});
