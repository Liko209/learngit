/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-03-07 16:53:14
 * Copyright © RingCentral. All rights reserved.
 */
import { useState } from 'react';
import { KeyMapper, DynamicRowManager } from '../DynamicRowManager';
import { FixedRowManager } from '../FixedRowManager';
import { AbstractRowManager } from '../AbstractRowManager';

const useRowManager = ({
  minRowHeight,
  fixedRowHeight,
  keyMapper,
}: {
  minRowHeight?: number;
  fixedRowHeight?: number;
  keyMapper: KeyMapper;
}) => {
  const [rowManager] = useState(() => {
    let result: AbstractRowManager;
    if (minRowHeight) {
      const rowManager = new DynamicRowManager({ minRowHeight });
      rowManager.setKeyMapper(keyMapper);
      result = rowManager;
    } else if (fixedRowHeight) {
      const rowManager = new FixedRowManager({ fixedRowHeight });
      result = rowManager;
    } else {
      throw new Error(
        `ERROR: At least provide 'minRowHeight' or 'fixedRowHeight'`,
      );
    }
    return result;
  });

  if (rowManager instanceof DynamicRowManager) {
    rowManager.setKeyMapper(keyMapper);
  }

  return rowManager;
};

export { useRowManager };
