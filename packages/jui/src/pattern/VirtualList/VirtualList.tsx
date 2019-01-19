/*
 * @Author: isaac.liu
 * @Date: 2019-01-02 15:02:44
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component, PureComponent, ReactNode } from 'react';
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
  isLoadingMore?: boolean;
};

@observer
class JuiVirtualList extends Component<JuiVirtualListProps> {
  static MIN_CELL_HEIGHT: number = 44;
  static OVERSCAN_ROW_COUNT: number = 4;
  private _dataSource: IVirtualListDataSource;
  private _cache: CellMeasurerCache;
  private _listRef: List;
  private _stopIndex: number;

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
    const { isLoadingMore } = this.props;
    if (isLoadingMore && index === this._stopIndex) {
      const { moreLoader } = this._dataSource;
      if (moreLoader) {
        return moreLoader();
      }
    }
    return this._dataSource.cellAtIndex(index, style);
  }

  private _renderDynamicCell = ({
    index,
    key,
    parent,
    style,
  }: ListRowProps) => {
    const { isLoadingMore } = this.props;
    if (isLoadingMore && index === this._stopIndex) {
      const { moreLoader } = this._dataSource;
      if (moreLoader) {
        return moreLoader();
      }
    }
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
      this._stopIndex = stopIndex;
      const result = await loadMore(startIndex, stopIndex);
      return result;
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
        >
          {({ onRowsRendered, registerChild }) => {
            return (
              <AutoSizer>
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

type JuiVirtualLoadListProps = {
  hasNextPage: boolean;
  isNextPageLoading: boolean;
  list: any[];
  loadNextPage: any;
  renderCell: (index: number) => ReactNode;
  moreLoader: () => ReactNode;
  rowHeight: number;
};

class JuiVirtualLoadList extends PureComponent<JuiVirtualLoadListProps> {
  private _listRef: List;
  private _registerRef = (ref: any, callback: (args: any) => void) => {
    this._listRef = ref;
    callback(ref);
  }
  componentWillReact() {
    if (this._listRef) {
      this._listRef.forceUpdateGrid();
    }
  }
  render() {
    const {
      /** Are there more items to load? (This information comes from the most recent API request.) */
      hasNextPage,
      /** Are we currently loading a page of items? (This may be an in-flight flag in your Redux store for example.) */
      isNextPageLoading,
      /** List of items loaded so far */
      list,
      /** Callback function (eg. Redux action-creator) responsible for loading the next page of items */
      loadNextPage,
      renderCell,
      moreLoader,
      rowHeight,
    } = this.props;
    // If there are more items to be loaded then add an extra row to hold a loading indicator.
    const rowCount = hasNextPage ? list.length + 1 : list.length;

    // Only load 1 page of items at a time.
    // Pass an empty callback to InfiniteLoader in case it asks us to load more than once.
    const loadMoreRows = isNextPageLoading ? () => {} : loadNextPage;

    // Every row is loaded except for our loading indicator row.
    const isRowLoaded = ({ index }: Index) =>
      !hasNextPage || index < list.length;

    // Render a list item or a loading indicator.
    const rowRenderer = ({ index, key, style }: ListRowProps) => {
      let content;

      if (!isRowLoaded({ index })) {
        content = moreLoader();
      } else {
        content = renderCell(index);
      }

      return (
        <div key={key} style={style}>
          {content}
        </div>
      );
    };

    const listProps = {
      rowCount,
      rowHeight,
      rowRenderer,
    } as ListProps;

    return (
      <JuiVirtualListWrapper>
        <InfiniteLoader
          isRowLoaded={isRowLoaded}
          loadMoreRows={loadMoreRows}
          rowCount={rowCount}
        >
          {({ onRowsRendered, registerChild }) => (
            <AutoSizer>
              {({ width, height }: Size) => {
                return (
                  <List
                    ref={ref => this._registerRef(ref, registerChild)}
                    onRowsRendered={onRowsRendered}
                    height={height}
                    width={width}
                    {...listProps}
                  />
                );
              }}
            </AutoSizer>
          )}
        </InfiniteLoader>
      </JuiVirtualListWrapper>
    );
  }
}

export { JuiVirtualList, JuiVirtualLoadList, JuiVirtualListProps };
