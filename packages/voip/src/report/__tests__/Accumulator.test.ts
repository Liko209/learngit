/*
 * @Author: Spike.Yang
 * @Date: 2019-05-13 13:44:08
 * Copyright © RingCentral. All rights reserved.
 */

import Accumulator from '../Accumulator';

describe('check Accumulator', () => {
  it('should Calculated correctly when add value', () => {
    const accumulator = new Accumulator('packetsLost');
    accumulator.addDateValue(1);
    accumulator.addDateValue(1);
    accumulator.addDateValue(1);
    accumulator.addDateValue(1);
    expect(accumulator.prop).toBe('packetsLost');
    expect(accumulator.value).toBe(0);
  });

  it('should Calculated correctly when add value', () => {
    const accumulator = new Accumulator('packetsReceived');
    accumulator.addDateValue(1);
    accumulator.addDateValue(2);
    accumulator.addDateValue(1);
    accumulator.addDateValue(0);
    expect(accumulator.prop).toBe('packetsReceived');
    expect(accumulator.value).toBeCloseTo(0.8, 1);
  });

  it('should Calculated correctly when add value', () => {
    const accumulator = new Accumulator('packetsReceived');
    accumulator.addDateValue(98);
    accumulator.addDateValue(99);
    accumulator.addDateValue(100);
    accumulator.addDateValue(100);
    expect(accumulator.prop).toBe('packetsReceived');
    expect(accumulator.value).toBeCloseTo(0.9, 1);
  });
});
