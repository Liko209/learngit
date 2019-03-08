/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-03-07 16:53:14
 * Copyright © RingCentral. All rights reserved.
 */
import { useState } from 'react';
import { KeyMapper, RowManager } from '../RowManager';

const useRowManager = ({
  minRowHeight,
  keyMapper,
}: {
  minRowHeight: number;
  keyMapper: KeyMapper;
}) => {
  const [rowManager] = useState(() => new RowManager({ minRowHeight }));
  rowManager.setKeyMapper(keyMapper);
  return rowManager;
};

export { useRowManager };
