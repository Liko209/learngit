/*
 * @Author: Spike.Yang
 * @Date: 2019-05-13 14:07:04
 * Copyright © RingCentral. All rights reserved.
 */

import { KEYS, deepClone, defaultItems } from '../util';

describe('check util', () => {
  it('should get correctly value when use deepClone()', () => {
    const item = deepClone({ bytesSent: 0 });
    expect(item).toEqual({ bytesSent: 0 });
  });

  it('should get correctly value when use defaultItems()', () => {
    const item = defaultItems();
    KEYS.forEach(key => {
      expect(item[key]).toBe(0);
    });
  });
});
