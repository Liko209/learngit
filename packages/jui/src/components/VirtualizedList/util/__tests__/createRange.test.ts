import { createRange } from '../createRange';

describe('createRange()', () => {
  it('1', () => {
    const { startIndex, stopIndex } = createRange({
      anchor: 1,
      size: 3,
      min: 0,
      max: 9,
    });

    expect(startIndex).toBe(0);
    expect(stopIndex).toBe(2);
  });

  it('2', () => {
    const { startIndex, stopIndex } = createRange({
      anchor: 2,
      size: 3,
      min: 0,
      max: 9,
    });

    expect(startIndex).toBe(1);
    expect(stopIndex).toBe(3);
  });

  it('3', () => {
    const result = createRange({
      anchor: 0,
      size: 3,
      min: 0,
      max: 9,
    });
    expect(result).toEqual({
      startIndex: 0,
      stopIndex: 2,
    });
  });

  it('min', () => {
    const result = createRange({
      anchor: 0,
      size: 3,
      min: 0,
      max: 9,
    });
    expect(result).toEqual({
      startIndex: 0,
      stopIndex: 2,
    });
  });

  it('max', () => {
    const result = createRange({
      anchor: 9,
      size: 3,
      min: 0,
      max: 9,
    });
    expect(result).toEqual({
      startIndex: 7,
      stopIndex: 9,
    });
  });
});
