/*
 * @Author: Paynter Chen
 * @Date: 2019-05-16 23:07:04
 * Copyright © RingCentral. All rights reserved.
 */
import { repeatString, toText } from '../stringUtils';

describe('stringUtils', () => {
  describe('repeatString', () => {
    it('should repeat string n times', () => {
      expect(repeatString('.', 0)).toEqual('');
      expect(repeatString('.', 1)).toEqual('.');
      expect(repeatString('.', 2)).toEqual('..');
    });
  });

  describe('toText', () => {
    it('should transform string correctly', () => {
      expect(toText('a')).toEqual('a');
    });
    it('should transform number correctly', () => {
      expect(toText(1)).toEqual('1');
    });
    it('should transform boolean correctly', () => {
      expect(toText(true)).toEqual('true');
      expect(toText(false)).toEqual('false');
    });
    it('should transform null correctly', () => {
      expect(toText(null)).toEqual('null');
    });
    it('should transform undefined correctly', () => {
      expect(toText(undefined)).toEqual('undefined');
    });
    it('should not transform function', () => {
      expect(toText(() => {})).toEqual('');
    });
    it('should not transform regexp', () => {
      expect(toText(/abc/)).toEqual('');
    });
    it('should transform object correctly', () => {
      expect(toText({ a: 'aa', b: 'bb', c: () => {}, regexp: /abc/ })).toEqual(
        'a: aa\nb: bb',
      );
      expect(
        toText({ a: 'aa', b: 'bb', c: { d: 'dd' }, e: { f: { g: 'gg' } } }),
      ).toEqual('a: aa\nb: bb\nc: \n d: dd\ne: \n f: \n  g: gg');
    });
    it('should transform array correctly', () => {
      expect(toText([1, '2'])).toEqual('[\n 1\n 2\n]');
      expect(toText([1, 2, [3, 4]])).toEqual('[\n 1\n 2\n [\n  3\n  4\n ]\n]');
      expect(toText([1, 2, [3, 4, [5, 6]]])).toEqual(
        '[\n 1\n 2\n [\n  3\n  4\n  [\n   5\n   6\n  ]\n ]\n]',
      );
      expect(toText([1, '2', { a: 'aa' }])).toEqual('[\n 1\n 2\n a: aa\n]');
      expect(toText([1, '2', () => {}, /abc/, 3])).toEqual('[\n 1\n 2\n 3\n]');
    });
    it('should transform complex type correctly', () => {
      const complexObject = {
        a: [
          {
            b: 'bb',
          },
        ],
      };
      expect(toText(complexObject)).toEqual('a: \n [\n  b: bb\n ]');
    });
  });
});
