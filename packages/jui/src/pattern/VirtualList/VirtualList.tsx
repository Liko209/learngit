/*
 * @Author: isaac.liu
 * @Date: 2019-01-02 15:02:44
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component, RefObject, createRef } from 'react';
import { observer } from 'mobx-react';
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
import { JuiVirtualListWrapper } from './VirtualListWrapper';

type JuiVirtualListProps = {
  dataSource: IVirtualListDataSource;
};

@observer
class JuiVirtualList extends Component<JuiVirtualListProps> {
  static MIN_CELL_HEIGHT: number = 44;
  static OVERSCAN_ROW_COUNT: number = 4;
  private _dataSource: IVirtualListDataSource;
  private _cache: CellMeasurerCache;
  private _sizerRef: RefObject<AutoSizer> = createRef();
  private _listRef: List;
  private _loaderRef: RefObject<InfiniteLoader> = createRef();

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
      return isRowLoaded(params.index);
    }
    return false;
  }

  private _loadMoreRows = async ({ startIndex, stopIndex }: IndexRange) => {
    const { loadMore } = this._dataSource;
    if (loadMore) {
      return await loadMore(startIndex, stopIndex);
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
    const current = this._listRef;
    if (current) {
      requestAnimationFrame(() => current.scrollToRow(index));
    }
  }

  scrollToPosition = (scrollTop: number) => {
    const current = this._listRef;
    if (current) {
      current.scrollToPosition(scrollTop);
    }
  }

  private _registerRef = (ref: any, callback: (args: any) => void) => {
    this._listRef = ref;
    callback(ref);
  }

  componentWillReact() {
    this._sizerRef.current && this._sizerRef.current.forceUpdate();
    this._loaderRef.current && this._loaderRef.current.forceUpdate();
    this._listRef.forceUpdate();
    this._listRef.forceUpdateGrid();
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
      <JuiVirtualListWrapper>
        <InfiniteLoader
          isRowLoaded={this._isRowLoaded}
          loadMoreRows={this._loadMoreRows}
          rowCount={cellCount}
          ref={this._loaderRef}
        >
          {({ onRowsRendered, registerChild }) => {
            return (
              <AutoSizer ref={this._sizerRef}>
                {({ width, height }: Size) => {
                  return (
                    <List
                      ref={ref => this._registerRef(ref, registerChild)}
                      onRowsRendered={onRowsRendered}
                      height={height}
                      width={width}
                      onScroll={this._dataSource.onScroll}
                      {...props}
                    />
                  );
                }}
              </AutoSizer>
            );
          }}
        </InfiniteLoader>
      </JuiVirtualListWrapper>
    );
  }
}

export { JuiVirtualList, JuiVirtualListProps };
