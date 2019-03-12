/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-03-07 16:46:15
 * Copyright © RingCentral. All rights reserved.
 */
import { IndexRange } from '../types';

const isRangeEqual = (left: IndexRange, right: IndexRange) => {
  return (
    left.startIndex === right.startIndex && left.stopIndex === right.stopIndex
  );
};

export { isRangeEqual };
