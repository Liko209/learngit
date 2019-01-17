/*
 * @Author: isaac.liu
 * @Date: 2019-01-02 15:02:50
 * Copyright © RingCentral. All rights reserved.
 */
import { CSSProperties, ReactElement, ReactNode } from 'react';
import { JuiVirtualCellProps, JuiVirtualCellOnLoadFunc } from './VirtualCell';

interface IVirtualListDataSource {
  minCellHeight?: () => number;

  countOfCell(): number;

  cellAtIndex<P extends JuiVirtualCellProps>(
    index: number,
    style: CSSProperties,
    onLoad?: JuiVirtualCellOnLoadFunc,
  ): ReactElement<P & JuiVirtualCellProps> | null;

  fixedCellHeight?: () => number;

  overscanCount?: () => number;

  // for infinite lad
  loadMore?: (startIndex: number, endIndex: number) => Promise<any>;

  isRowLoaded?: (params: number) => boolean;

  // empty content
  renderEmptyContent?: () => JSX.Element;

  onScroll?: (event: any) => void;

  // loader for full page
  firstLoader?: () => ReactNode;

  // loader for `load more`
  moreLoader?: () => ReactNode;

  isEmptyList: () => boolean;
}

export { IVirtualListDataSource };
