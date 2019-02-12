/*
 * @Author: isaac.liu
 * @Date: 2019-01-02 15:02:50
 * Copyright © RingCentral. All rights reserved.
 */
import { JuiVirtualCellProps } from './VirtualCell';

interface IVirtualListDataSource {
  minCellHeight?: () => number;

  countOfCell(): number;

  cellAtIndex(params: JuiVirtualCellProps): JSX.Element;

  fixedCellHeight?: (index: number) => number;

  overscanCount?: () => number;

  // for loading data
  loadMore?: (startIndex: number, endIndex: number) => Promise<any>;

  isRowLoaded?: (params: number) => boolean;

  // empty content
  renderEmptyContent?: () => JSX.Element;

  onScroll?: (event: any) => void;

  moreLoader?: () => JSX.Element;
}

export { IVirtualListDataSource };
