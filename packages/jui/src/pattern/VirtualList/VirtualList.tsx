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
import { noop } from '../../foundation/utils';
import { JuiVirtualListWrapper } from './VirtualListWrapper';
import { IVirtualListDataSource } from './VirtualListDataSource';
import {
  JuiVirtualCellOnLoadFunc,
  JuiObservedCellWrapper,
  JuiVirtualCellProps,
} from './VirtualCell';

type JuiVirtualListRowsRenderInfo = {
  overscanStartIndex: number;
  overscanStopIndex: number;
  startIndex: number;
  stopIndex: number;
};

type JuiVirtualListProps = {
  dataSource: IVirtualListDataSource;
  isLoading: boolean;
  width: number;
  height: number;
  overscan: number;
  threshold: number;
  minimumBatchSize: number;
  onBeforeRowsRendered: (info: JuiVirtualListRowsRenderInfo) => void;
};

class JuiVirtualList extends Component<JuiVirtualListProps> {
  static MIN_CELL_HEIGHT: number = 10;
  private _cache: CellMeasurerCache;
  private _listRef: List;

  static defaultProps = {
    isLoading: false,
    threshold: 15,
    overscan: 10,
    minimumBatchSize: 10,
    onBeforeRowsRendered: noop,
  };

  private _registerList = (callback: (ref: List) => void) => (ref: List) => {
    this._listRef = ref;
    callback && callback(ref);
  }

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
    const { dataSource } = this.props;
    const observeCell = dataSource.observeCell && dataSource.observeCell();
    const cellCount = dataSource.countOfCell();
    if (index >= cellCount) {
      return;
    }
    return (
      <CellMeasurer
        cache={this.cache}
        columnIndex={0}
        key={key}
        rowIndex={index}
        parent={parent}
      >
        {({ measure }: { measure: JuiVirtualCellOnLoadFunc }) => {
          const props: JuiVirtualCellProps = {
            index,
            style,
            onLoad: () => {
              this._cache.clear(index, 0);
              measure();
            },
          };
          const cell = dataSource.cellAtIndex(props);
          return observeCell ? (
            <JuiObservedCellWrapper {...props}>{cell}</JuiObservedCellWrapper>
          ) : (
            cell
          );
        }}
      </CellMeasurer>
    );
  }

  loadMore = async ({ startIndex, stopIndex }: IndexRange) => {
    const { isLoading, dataSource } = this.props;
    if (!isLoading && dataSource.loadMore) {
      return await dataSource.loadMore(startIndex, stopIndex);
    }
  }

  isRowLoaded = ({ index }: Index) => {
    return index < this.props.dataSource.countOfCell();
  }

  rowRenderer = ({ index, style }: ListRowProps) => {
    const { dataSource } = this.props;
    const cellCount = dataSource.countOfCell();

    if (index < cellCount) {
      return dataSource.cellAtIndex({ index, style });
    }

    return (
      <div key={cellCount} style={style}>
        {dataSource.moreLoader && dataSource.moreLoader()}
      </div>
    );
  }

  scrollToCell = (index: number) => {
    if (Number.isInteger(index)) {
      // This is trick for virtual list.
      this._listRef.scrollToRow(index);
      window.requestAnimationFrame(() => this._listRef.scrollToRow(index));
    }
  }

  scrollToPosition = (scrollTop: number) => {
    this._listRef.scrollToPosition(scrollTop);
  }

  render() {
    const {
      isLoading,
      dataSource,
      width,
      height,
      threshold,
      overscan,
      minimumBatchSize,
      onBeforeRowsRendered,
    } = this.props;
    const { renderEmptyContent, fixedCellHeight } = dataSource;
    const cellCount = dataSource.countOfCell();
    const rowCount = isLoading ? cellCount + 1 : cellCount;

    const props: ListProps = {
      rowCount,
      width,
      height,
    } as ListProps;

    if (overscan) {
      props.overscanRowCount = overscan;
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
            rowCount={Infinity}
            isRowLoaded={this.isRowLoaded}
            loadMoreRows={this.loadMore}
            threshold={threshold}
            minimumBatchSize={minimumBatchSize}
          >
            {({ onRowsRendered, registerChild }) => (
              <List
                ref={this._registerList(registerChild)}
                onRowsRendered={(info: JuiVirtualListRowsRenderInfo) => {
                  onBeforeRowsRendered(info);
                  onRowsRendered(info);
                }}
                {...props}
              />
            )}
          </InfiniteLoader>
        )}
      </JuiVirtualListWrapper>
    );
  }
}

export { JuiVirtualList, JuiVirtualListProps, JuiVirtualListRowsRenderInfo };
