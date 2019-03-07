/*
 * @Author: isaac.liu
 * @Date: 2019-02-01 08:41:29
 * Copyright © RingCentral. All rights reserved.
 */

import { buildContainer } from '@/base';
import { PinnedCellView } from './PinnedCell.View';
import { PinnedCellViewModel } from './PinnedCell.ViewModel';
import { PinnedCellProps } from './types';

const PinnedCell = buildContainer<PinnedCellProps>({
  View: PinnedCellView,
  ViewModel: PinnedCellViewModel,
});

export { PinnedCell };
