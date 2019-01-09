/*
 * @Author: isaac.liu
 * @Date: 2019-01-02 15:02:50
 * Copyright © RingCentral. All rights reserved.
 */
import { CSSProperties, ReactElement } from 'react';
import { IndexRange, Index } from 'react-virtualized';
import { JuiVirtualCellProps, JuiVirtualCellOnLoadFunc } from './VirtualCell';

interface IVirtualListDataSource {
  minCellHeight?: () => number;

  countOfCell(): number;

  cellAtIndex<P extends JuiVirtualCellProps>(
    index: number,
    style: CSSProperties,
    onLoad?: JuiVirtualCellOnLoadFunc,
  ): ReactElement<P & JuiVirtualCellProps>;

  fixedCellHeight?: () => number;

  overscanCount?: () => number;

  // for infinite lad
  loadMore?: (params: IndexRange) => Promise<any>;

  isRowLoaded?: (params: Index) => boolean;

  // empty content
  renderEmptyContent?: () => JSX.Element;
}

export { IVirtualListDataSource };
