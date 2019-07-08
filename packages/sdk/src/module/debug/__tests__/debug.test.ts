/*
 * @Author: Paynter Chen
 * @Date: 2019-07-08 10:42:54
 * Copyright © RingCentral. All rights reserved.
 */

import { debug } from '../debug';

describe('debug', () => {
  describe('constructor()', () => {
    it('should inject _debug to window', () => {
      expect(window['_debug']).not.toBeUndefined();
    });
  });
  describe('inject()', () => {
    it('should inject log to window', () => {
      expect(debug['_debug']['log']).not.toBeUndefined();
    });
    it('should inject _debug to window', () => {
      debug.inject('test', 123);
      expect(window['_debug']['test']).toEqual(123);
    });
  });
});
