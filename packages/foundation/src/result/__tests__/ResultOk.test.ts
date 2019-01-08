/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-11-26 11:04:17
 * Copyright © RingCentral. All rights reserved.
 */

import { ResultOk } from '../ResultOk';

describe('ResultOk', () => {
  describe('constructor()', () => {
    it('should store data', () => {
      const obj = { foo: 'bar' };
      const arr = [1, 2, 3];

      expect(new ResultOk(1).data).toBe(1);
      expect(new ResultOk('message').data).toBe('message');
      expect(new ResultOk(true).data).toBe(true);
      expect(new ResultOk(null).data).toBe(null);
      expect(new ResultOk(undefined).data).toBe(undefined);
      expect(new ResultOk(obj).data).toBe(obj);
      expect(new ResultOk(arr).data).toBe(arr);
    });
  });

  describe('match()', () => {
    it('should match ok case', () => {
      const data = 'message';
      const result = new ResultOk(data);
      const cases = {
        Ok: jest.fn().mockName('Ok()'),
        Err: jest.fn().mockName('Err()'),
      };
      result.match(cases);

      expect(cases.Ok).toHaveBeenCalledWith(data);
      expect(cases.Err).not.toHaveBeenCalled();
    });
  });

  describe('unwrap()', () => {
    it('should return data', () => {
      expect(new ResultOk('message').unwrap()).toBe('message');
    });
  });

  describe('expect()', () => {
    it('should return data', () => {
      expect(new ResultOk('message').expect('')).toBe('message');
    });
  });

  describe('isOk()', () => {
    it('should be truthy', () => {
      const result = new ResultOk(1);
      expect(result.isOk()).toBeTruthy();
    });
  });

  describe('isErr()', () => {
    it('should be falsy', () => { });
    const result = new ResultOk(1);
    expect(result.isErr()).toBeFalsy();
  });
});
