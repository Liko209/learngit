import { createRangeFromAnchor } from '../createRange';

describe('createRange()', () => {
  it('should ', () => {});
});

describe('createRangeFromAnchor()', () => {
  it('should create range from given anchor and size', () => {
    const result = createRangeFromAnchor({
      anchor: 1,
      size: 3,
      min: 0,
      max: 9,
    });

    expect(result).toEqual({
      startIndex: 0,
      stopIndex: 2,
    });
  });

  it('should handle min', () => {
    const result = createRangeFromAnchor({
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
    const result = createRangeFromAnchor({
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
