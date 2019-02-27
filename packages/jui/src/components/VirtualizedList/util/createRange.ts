export type CreateRangeParams = {
  /**
   * Anchor index of range
   */
  anchor: number;
  /**
   * Size of range
   */
  size: number;
  /**
   * Min index of range
   */
  min: number;
  /**
   * Max index of range
   */
  max: number;
};

/**
 * Create a range from given anchor
 */
const createRange = ({ anchor, size, min, max }: CreateRangeParams) => {
  const halfSize = Math.floor(size / 2);

  let startIndex = anchor - halfSize;
  if (startIndex < min) {
    startIndex = min;
  }

  let stopIndex = startIndex + size - 1;
  if (stopIndex > max) {
    stopIndex = max;
  }

  if (stopIndex - size + 1 < startIndex) {
    startIndex = Math.max(stopIndex - size + 1, min);
  }
  return { startIndex, stopIndex };
};

export { createRange };
