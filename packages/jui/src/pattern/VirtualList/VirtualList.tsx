/*
 * @Author: isaac.liu
 * @Date: 2019-01-19 21:41:19
 * Copyright © RingCentral. All rights reserved.
 */
import React, { PureComponent } from 'react';
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

type JuiVirtualListProps<K, V> = {
  dataSource: IVirtualListDataSource<K, V>;
  observeCell: boolean;
  width: number;
  height: number;
  minCellHeight: number;
  overscan: number;
  threshold: number;
  minimumBatchSize: number;
  fixedCellHeight?: number;
  initialScrollToIndex: number;
  stickToBottom: boolean;
  moreLoader?: () => JSX.Element;
  rowRenderer: (params: JuiVirtualCellProps<V>) => React.ReactNode;
  noContentRenderer: () => JSX.Element;
  onBeforeRowsRendered: (info: JuiVirtualListRowsRenderInfo) => void;
  onVisibilityChange: (visibleRange: IndexRange) => void;
  onScroll?: (event: any) => void;
};

type State = {
  atBottom: boolean;
};

class JuiVirtualList<K, V> extends PureComponent<
  JuiVirtualListProps<K, V>,
  State
> {
  static MIN_CELL_HEIGHT: number = 44;
  private _cache: CellMeasurerCache;
  private _listRef: List;
  private _skipStickTo: boolean = false;
  private _forceScrollToIndex: number = 0;

  static defaultProps = {
    minCellHeight: JuiVirtualList.MIN_CELL_HEIGHT,
    threshold: 15,
    overscan: 10,
    minimumBatchSize: 10,
    stickToBottom: false,
    observeCell: false,
    initialScrollToIndex: 0,
    noContentRenderer: () => null,
    onBeforeRowsRendered: noop,
    onVisibilityChange: noop,
    onScroll: noop,
  };

  state: State = {
    atBottom: false,
  };

  componentDidMount() {
    this.loadInitialData();
  }

  private _registerList = (callback: (ref: List) => void) => (ref: List) => {
    this._listRef = ref;
    callback && callback(ref);
  }

  private _getFixedCellHeight = () =>
    this.props.fixedCellHeight || this.props.minCellHeight

  private get cache() {
    if (!this._cache) {
      this._cache = new CellMeasurerCache({
        minHeight: this.props.minCellHeight,
        fixedWidth: true,
      });
    }
    return this._cache;
  }

  private _dynamicRowRenderer = ({
    index: rowIndex,
    key,
    parent,
    style,
  }: ListRowProps) => {
    const { observeCell, rowRenderer } = this.props;

    if (this._isSpinnerRow(rowIndex)) {
      return this._renderMoreSpinner(rowIndex, style);
    }

    return (
      <CellMeasurer
        cache={this.cache}
        columnIndex={0}
        key={key}
        rowIndex={rowIndex}
        parent={parent}
      >
        {({ measure }: { measure: JuiVirtualCellOnLoadFunc }) => {
          const dataIndex = this._toDataIndex(rowIndex);

          const props: JuiVirtualCellProps<V> = {
            style,
            index: dataIndex,
            item: this._getItem(dataIndex)!,
            onLoad: measure,
          };

          const cell = rowRenderer(props);

          return observeCell ? (
            <JuiObservedCellWrapper {...props}>{cell}</JuiObservedCellWrapper>
          ) : (
            cell
          );
        }}
      </CellMeasurer>
    );
  }

  private _getItem(dataIndex: number) {
    return this.props.dataSource.get(dataIndex as any);
  }

  private _handleScroll = (info: {
    clientHeight: number;
    scrollHeight: number;
    scrollTop: number;
  }) => {
    const { clientHeight, scrollHeight, scrollTop } = info;
    const atBottom = clientHeight + scrollTop === scrollHeight;
    this.setState({ atBottom });
    this.props.onScroll && this.props.onScroll(info);
  }

  loadInitialData = async () => {
    const { dataSource, stickToBottom } = this.props;

    if (dataSource.loadInitialData) {
      await dataSource.loadInitialData();

      if (this.props.initialScrollToIndex) {
        this._forceScrollToIndex = this.props.initialScrollToIndex;
        if (this._isLoadingMore('up')) {
          this._forceScrollToIndex++;
        }
      } else if (stickToBottom) {
        this._forceScrollToIndex = dataSource.size() - 1;
      }

      this.forceUpdate(() => {
        this._forceScrollToIndex = 0;
      });
    }
  }

  loadMore = async ({ startIndex, stopIndex }: IndexRange) => {
    const { dataSource } = this.props;
    const hasMore = dataSource.hasMore && dataSource.hasMore();
    const isLoading = dataSource.isLoading && dataSource.isLoading();

    if (!isLoading && hasMore) {
      const oldSize = dataSource.size();
      if (dataSource.infiniteLoadMore) {
        await dataSource.infiniteLoadMore(startIndex, stopIndex);
        this._skipStickTo = true;
      } else if (dataSource.loadMore) {
        await dataSource.loadMore(startIndex, stopIndex);
        this._skipStickTo = true;
      } else {
        return;
      }
      if (dataSource.size() !== oldSize) {
        this.forceUpdate(() => {
          this._skipStickTo = false;
        });
      }
    }
  }

  isRowLoaded = ({ index }: Index) => {
    return !!this.props.dataSource.get(index as any);
  }

  private _toDataIndex(rowIndex: number) {
    const { dataSource } = this.props;
    if (dataSource.isLoadingMore && dataSource.isLoadingMore('up')) {
      return rowIndex + 1;
    }
    return rowIndex;
  }

  private _isLoadingMore(direction: 'up' | 'down') {
    const { dataSource } = this.props;
    if (!dataSource.isLoadingMore) return false;
    return dataSource.isLoadingMore(direction);
  }

  private _isSpinnerRow(rowIndex: number) {
    if (rowIndex === 0) {
      return this._isLoadingMore('up');
    }

    if (rowIndex === this.props.dataSource.size()) {
      return this._isLoadingMore('down');
    }

    return false;
  }

  rowRenderer = ({ index: rowIndex, style }: ListRowProps) => {
    const { rowRenderer } = this.props;

    if (this._isSpinnerRow(rowIndex)) {
      return this._renderMoreSpinner(rowIndex, style);
    }

    const dataIndex = this._toDataIndex(rowIndex);
    return rowRenderer({
      style,
      index: dataIndex,
      item: this._getItem(dataIndex)!,
    });
  }

  scrollToCell = (index: number) => {
    if (Number.isInteger(index)) {
      // This is trick for virtual list.
      this._listRef.scrollToRow(index);
      window.requestAnimationFrame(() => this._listRef.scrollToRow(index));
    }
  }

  private _renderMoreSpinner(index: number, style: React.CSSProperties) {
    const { moreLoader } = this.props;
    return (
      <div key={index} style={style}>
        {moreLoader && moreLoader()}
      </div>
    );
  }

  render() {
    const {
      dataSource,
      width,
      height,
      threshold,
      overscan,
      fixedCellHeight,
      minimumBatchSize,
      onBeforeRowsRendered,
      noContentRenderer,
      stickToBottom,
    } = this.props;
    const { atBottom } = this.state;

    let spinnerCount = 0;
    if (this._isLoadingMore('up')) {
      spinnerCount++;
    }
    if (this._isLoadingMore('down')) {
      spinnerCount++;
    }

    const dataCount = dataSource.size();
    const rowCount = dataCount + spinnerCount;

    const props: ListProps = {
      width,
      height,
    } as ListProps;

    if (this._forceScrollToIndex) {
      props.scrollToIndex = this._forceScrollToIndex;
    } else if (stickToBottom && !this._skipStickTo && atBottom) {
      props.scrollToIndex = rowCount - 1;
    }

    if (fixedCellHeight) {
      props.rowRenderer = this.rowRenderer;
      props.rowHeight = this._getFixedCellHeight;
    } else {
      props.deferredMeasurementCache = this.cache;
      props.estimatedRowSize = JuiVirtualList.MIN_CELL_HEIGHT;
      props.rowHeight = this.cache.rowHeight;
      props.rowRenderer = this._dynamicRowRenderer;
    }

    let total: number;
    if (dataSource.total) {
      total = dataSource.total();
    } else if (dataSource.hasMore) {
      total = dataSource.hasMore() ? Infinity : rowCount;
    } else {
      total = dataSource.size();
    }

    const isEmpty = total === 0;

    return (
      <JuiVirtualListWrapper>
        {isEmpty && noContentRenderer()}
        {!isEmpty && (
          <InfiniteLoader
            rowCount={total}
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
                onScroll={this._handleScroll}
                overscanRowCount={overscan}
                rowCount={rowCount}
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
