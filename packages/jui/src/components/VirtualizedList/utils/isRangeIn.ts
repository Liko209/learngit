/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-03-19 14:40:03
 * Copyright © RingCentral. All rights reserved.
 */
import { IndexRange } from '../types';

/**
 * Check if range2 in range1
 */
const isRangeIn = (range1: IndexRange, range2: IndexRange) => {
  return (
    range1.startIndex <= range2.startIndex &&
    range1.stopIndex >= range2.stopIndex
  );
};

export { isRangeIn };
