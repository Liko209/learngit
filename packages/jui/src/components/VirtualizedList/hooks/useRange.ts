/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-03-07 16:54:43
 * Copyright © RingCentral. All rights reserved.
 */
import React, { useState } from 'react';
import { IndexRange } from '../types';

const useRange = (
  initialRange: IndexRange | (() => IndexRange),
): [IndexRange, React.Dispatch<React.SetStateAction<IndexRange>>] => {
  const [range, setRange] = useState(initialRange);
  return [range, setRange];
};

export { useRange };
