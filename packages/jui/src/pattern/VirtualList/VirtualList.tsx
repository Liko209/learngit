/*
 * @Author: isaac.liu
 * @Date: 2019-01-02 15:02:44
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component, RefObject, createRef } from 'react';
import {
  AutoSizer,
  List,
  ListRowProps,
  CellMeasurer,
  CellMeasurerCache,
  InfiniteLoader,
  Index,
  IndexRange,
  Size,
  ListProps,
} from 'react-virtualized';
import { IVirtualListDataSource } from './VirtualListDataSource';
import { JuiVirtualCellOnLoadFunc } from './VirtualCell';

type JuiVirtualListProps = {
  dataSource: IVirtualListDataSource;
};

class JuiVirtualList extends Component<JuiVirtualListProps> {
  static MIN_CELL_HEIGHT: number = 44;
  static OVERSCAN_ROW_COUNT: number = 4;
  private _dataSource: IVirtualListDataSource;
  private _cache: CellMeasurerCache;
  private _listRef: RefObject<List> = createRef();

  constructor(props: JuiVirtualListProps) {
    super(props);
    const { dataSource } = props;
    this._dataSource = dataSource;
  }

  get dataSource() {
    return this._dataSource;
  }

  private get cache() {
    if (!this._cache) {
      this._cache = new CellMeasurerCache({
        minHeight: this.dataSource.minCellHeight
          ? this.dataSource.minCellHeight()
          : JuiVirtualList.MIN_CELL_HEIGHT,
        fixedWidth: true,
      });
    }
    return this._cache;
  }

  private _renderFixedCell = ({ index, style }: ListRowProps) => {
    return this._dataSource.cellAtIndex(index, style);
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
          this._dataSource.cellAtIndex(index, style, measure)}
      </CellMeasurer>
    );
  }

  private _isRowLoaded = (params: Index) => {
    const { isRowLoaded } = this._dataSource;
    if (isRowLoaded) {
      return isRowLoaded(params);
    }
    return false;
  }

  private _loadMoreRows = async (params: IndexRange) => {
    const { loadMore } = this._dataSource;
    if (loadMore) {
      return await loadMore(params);
    }
  }

  private _renderEmptyContent = (): JSX.Element => {
    const { renderEmptyContent } = this._dataSource;
    if (renderEmptyContent) {
      return renderEmptyContent();
    }
    return <></>;
  }

  scrollToCell = (index: number) => {
    const { current } = this._listRef;
    if (current) {
      requestAnimationFrame(() => current.scrollToRow(index));
    }
  }

  scrollToPosition = (scrollTop: number) => {
    const { current } = this._listRef;
    if (current) {
      current.scrollToPosition(scrollTop);
    }
  }

  private _registerRef = (ref: any, callback: (args: any) => void) => {
    this._listRef = ref;
    callback(ref);
  }

  render() {
    const cellCount = this._dataSource.countOfCell();
    const fixedHeight = this._dataSource.fixedCellHeight
      ? this._dataSource.fixedCellHeight()
      : undefined;

    const props: ListProps = {
      rowCount: cellCount,
      noRowsRenderer: this._renderEmptyContent,
    } as ListProps;

    if (typeof fixedHeight !== 'undefined') {
      props.rowRenderer = this._renderFixedCell;
      props.rowHeight = fixedHeight;
    } else {
      props.deferredMeasurementCache = this.cache;
      props.estimatedRowSize = JuiVirtualList.MIN_CELL_HEIGHT;
      props.overscanRowCount = this._dataSource.overscanCount
        ? this._dataSource.overscanCount()
        : JuiVirtualList.OVERSCAN_ROW_COUNT;
      props.rowHeight = this.cache.rowHeight;
      props.rowRenderer = this._renderDynamicCell;
    }

    return (
      <AutoSizer>
        {({ width, height }: Size) => (
          <InfiniteLoader
            isRowLoaded={this._isRowLoaded}
            loadMoreRows={this._loadMoreRows}
            rowCount={cellCount}
          >
            {({ onRowsRendered, registerChild }) => {
              return (
                <List
                  ref={ref => this._registerRef(ref, registerChild)}
                  onRowsRendered={onRowsRendered}
                  height={height}
                  width={width}
                  {...props}
                />
              );
            }}
          </InfiniteLoader>
        )}
      </AutoSizer>
    );
  }
}

export { JuiVirtualList, JuiVirtualListProps };
