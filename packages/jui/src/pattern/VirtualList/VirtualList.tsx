/*
 * @Author: isaac.liu
 * @Date: 2019-01-19 21:41:19
 * Copyright © RingCentral. All rights reserved.
 */
import React, { Component } from 'react';
import {
  InfiniteLoader,
  List,
  Index,
  ListRowProps,
  IndexRange,
  CellMeasurer,
  CellMeasurerCache,
  ListProps,
} from 'react-virtualized';
import { JuiVirtualListWrapper } from './VirtualListWrapper';
import { IVirtualListDataSource } from './VirtualListDataSource';
import { JuiVirtualCellOnLoadFunc } from './VirtualCell';

type JuiVirtualListProps = {
  dataSource: IVirtualListDataSource;
  isLoading: boolean;
  width: number;
  height: number;
  threshold?: number;
};

class JuiVirtualList extends Component<JuiVirtualListProps> {
  static MIN_CELL_HEIGHT: number = 44;
  private _cache: CellMeasurerCache;

  static defaultProps = {
    isLoading: false,
    threshold: 1,
  };

  private _rowHeight = ({ index }: Index) =>
    this.props.dataSource.fixedCellHeight!(index)
  private get cache() {
    if (!this._cache) {
      const { minCellHeight } = this.props.dataSource;
      this._cache = new CellMeasurerCache({
        minHeight: minCellHeight
          ? minCellHeight()
          : JuiVirtualList.MIN_CELL_HEIGHT,
        fixedWidth: true,
      });
    }
    return this._cache;
  }

  private _renderDynamicCell = ({
    index,
    key,
    parent,
    style,
  }: ListRowProps) => {
    return (
      <CellMeasurer
        cache={this.cache}
        columnIndex={0}
        key={key}
        rowIndex={index}
        parent={parent}
      >
        {({ measure }: { measure: JuiVirtualCellOnLoadFunc }) =>
          this.props.dataSource.cellAtIndex(index, style, measure)}
      </CellMeasurer>
    );
  }

  loadMore = async ({ startIndex, stopIndex }: IndexRange) => {
    const { isLoading, dataSource } = this.props;
    if (!isLoading) {
      return await dataSource.loadMore!(startIndex, stopIndex);
    }
  }

  isRowLoaded = ({ index }: Index) => {
    const { dataSource, threshold } = this.props;
    const cellCount = dataSource.countOfCell();
    const loaded = index < cellCount - threshold!;
    return loaded;
  }

  rowRenderer = ({ index, style }: ListRowProps) => {
    const { dataSource } = this.props;
    const cellCount = dataSource.countOfCell();
    if (index < cellCount) {
      return dataSource.cellAtIndex(index, style);
    }

    return (
      <div key={cellCount} style={style}>
        {dataSource.moreLoader!()}
      </div>
    );
  }

  render() {
    const { isLoading, dataSource, width, height } = this.props;
    const { renderEmptyContent, overscanCount, fixedCellHeight } = dataSource;
    const cellCount = dataSource.countOfCell();
    const rowCount = isLoading ? cellCount + 1 : cellCount;

    const props: ListProps = {
      rowCount,
      width,
      height,
    } as ListProps;

    if (overscanCount) {
      props.overscanRowCount = overscanCount();
    }

    if (fixedCellHeight) {
      props.rowRenderer = this.rowRenderer;
      props.rowHeight = this._rowHeight;
    } else {
      props.deferredMeasurementCache = this.cache;
      props.estimatedRowSize = JuiVirtualList.MIN_CELL_HEIGHT;
      props.rowHeight = this.cache.rowHeight;
      props.rowRenderer = this._renderDynamicCell;
    }

    return (
      <JuiVirtualListWrapper>
        {cellCount === 0 && renderEmptyContent && renderEmptyContent()}
        {rowCount !== 0 && (
          <InfiniteLoader
            rowCount={rowCount}
            isRowLoaded={this.isRowLoaded}
            loadMoreRows={this.loadMore}
          >
            {({ onRowsRendered, registerChild }) => (
              <List
                ref={registerChild}
                onRowsRendered={onRowsRendered}
                {...props}
              />
            )}
          </InfiniteLoader>
        )}
      </JuiVirtualListWrapper>
    );
  }
}

export { JuiVirtualList, JuiVirtualListProps };
