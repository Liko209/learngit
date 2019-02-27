import { createRange } from '../createRange';

describe('createRange()', () => {
  it('should create range from given anchor and size', () => {
    const { startIndex, stopIndex } = createRange({
      anchor: 1,
      size: 3,
      min: 0,
      max: 9,
    });

    expect(startIndex).toBe(0);
    expect(stopIndex).toBe(2);
  });

  it('should handle min', () => {
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

  it('should handle max', () => {
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
