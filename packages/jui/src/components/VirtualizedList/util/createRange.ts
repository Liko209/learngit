/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-02-27 17:41:26
 * Copyright © RingCentral. All rights reserved.
 */
type BaseCreateRangeParams = {
  /**
   * Size of range
   */
  size: number;
  /**
   * Min index of range
   */
  min?: number;
  /**
   * Max index of range
   */
  max?: number;
};

type CreateRangeFromAnchorParams = BaseCreateRangeParams & {
  /**
   * Anchor index of range
   */
  anchor: number;
};

type CreateRangeFromStartIndexParams = BaseCreateRangeParams & {
  /**
   * Start index of range
   */
  startIndex: number;
};

/**
 * Create a range from given anchor
 */
const createRange = ({
  startIndex,
  size,
  min = -Infinity,
  max = Infinity,
}: CreateRangeFromStartIndexParams) => {
  let resultStartIndex = startIndex;

  if (resultStartIndex < min) {
    resultStartIndex = min;
  }

  let resultStopIndex = resultStartIndex + size - 1;
  if (resultStopIndex > max) {
    resultStopIndex = max;
  }

  if (resultStopIndex - size + 1 < resultStartIndex) {
    resultStartIndex = Math.max(resultStopIndex - size + 1, min);
  }
  return { startIndex: resultStartIndex, stopIndex: resultStopIndex };
};

const createRangeFromAnchor = ({
  anchor,
  size,
  min = -Infinity,
  max = Infinity,
}: CreateRangeFromAnchorParams) => {
  return createRange({
    size,
    min,
    max,
    startIndex: anchor - Math.floor(size / 2),
  });
};

export {
  createRange,
  createRangeFromAnchor,
  CreateRangeFromStartIndexParams,
  CreateRangeFromAnchorParams,
};
