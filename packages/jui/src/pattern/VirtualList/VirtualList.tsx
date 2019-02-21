/*
 * @Author: isaac.liu
 * @Date: 2019-01-19 21:41:19
 * Copyright © RingCentral. All rights reserved.
 */
import React, { Component, ComponentType } from 'react';
import {
  // AutoSizer,
  InfiniteLoader,
  List,
  Index,
  ListRowProps,
  IndexRange,
} from 'react-virtualized';
import { JuiVirtualListWrapper } from './VirtualListWrapper';
import { IVirtualListDataSource } from './VirtualListDataSource';
import { withLoadingMore } from '../../hoc/withLoading';

type JuiVirtualListProps = {
  dataSource: IVirtualListDataSource;
  loadingMoreClass?: ComponentType;
  isLoading: boolean;
  width: number;
  height: number;
  threshold?: number;
};

class JuiVirtualList extends Component<JuiVirtualListProps> {
  static defaultProps = {
    isLoading: false,
    threshold: 1,
  };

  private _rowHeight = ({ index }: Index) =>
    this.props.dataSource.fixedCellHeight!()

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

    return <div key={cellCount} style={style} />;
  }

  render() {
    const {
      isLoading,
      dataSource,
      width,
      height,
      loadingMoreClass,
    } = this.props;
    const cellCount = dataSource.countOfCell();
    const rowCount = cellCount;
    const { renderEmptyContent, onScroll = undefined } = dataSource;
    const Wrapper = withLoadingMore(JuiVirtualListWrapper, loadingMoreClass);
    return (
      <Wrapper viewRef={{} as any} loadingBottom={isLoading} loadingTop={false}>
        <>
          {cellCount === 0 && renderEmptyContent && renderEmptyContent()}
          {rowCount !== 0 && (
            <InfiniteLoader
              rowCount={rowCount}
              isRowLoaded={this.isRowLoaded}
              loadMoreRows={this.loadMore}
            >
              {({ onRowsRendered, registerChild }) => (
                <List
                  overscanRowCount={20}
                  rowCount={rowCount}
                  width={width}
                  height={height}
                  rowHeight={this._rowHeight}
                  ref={registerChild}
                  onScroll={onScroll}
                  noRowsRenderer={dataSource.renderEmptyContent}
                  onRowsRendered={onRowsRendered}
                  rowRenderer={this.rowRenderer}
                />
              )}
            </InfiniteLoader>
          )}
        </>
      </Wrapper>
    );
  }
}

export { JuiVirtualList, JuiVirtualListProps };
