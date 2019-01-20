/*
 * @Author: isaac.liu
 * @Date: 2019-01-19 21:41:19
 * Copyright © RingCentral. All rights reserved.
 */
import React, { Component, ReactNode, CSSProperties } from 'react';
import ReactDOM from 'react-dom';
import {
  AutoSizer,
  InfiniteLoader,
  List,
  Index,
  ListRowProps,
  IndexRange,
} from 'react-virtualized';
import { JuiVirtualListWrapper } from './VirtualListWrapper';

type InfiniteScrollProps = {
  loadMore: (startIndex: number, endIndex: number) => Promise<any>;
  renderRow: (index: number, style: CSSProperties) => ReactNode;
  rowHeight: (index: number) => number;
  threshold: number;
  isLoading: boolean;
  renderLoading: () => ReactNode;
  cellCount: number;
  noRowsRenderer?: () => JSX.Element;
};

class JuiInfiniteList extends Component<InfiniteScrollProps> {
  static defaultProps = {
    isLoading: false,
  };
  private virtualScroll: List;

  private _rowHeight = ({ index }: Index) => this.props.rowHeight(index);

  loadMore = async ({ startIndex, stopIndex }: IndexRange) => {
    const { isLoading, loadMore } = this.props;
    if (!isLoading) {
      loadMore(startIndex, stopIndex);
    }
  }

  isRowLoaded = ({ index }: Index) => {
    const { cellCount, threshold } = this.props;
    const loaded = index < cellCount - threshold;
    return loaded;
  }

  adjustScrollPos = (adj: number) => {
    const virtualScroll = ReactDOM.findDOMNode(this.virtualScroll) as Element;
    if (
      virtualScroll.scrollTop !==
      virtualScroll.scrollHeight - virtualScroll.clientHeight
    ) {
      virtualScroll.scrollTop += adj;
    }
  }

  rowRenderer = ({ index, style }: ListRowProps) => {
    const { cellCount, renderRow, renderLoading } = this.props;

    if (index < cellCount) {
      return renderRow(index, style);
    }

    return (
      <div key={cellCount} style={style}>
        {renderLoading()}
      </div>
    );
  }

  render() {
    const { isLoading, cellCount, noRowsRenderer } = this.props;
    const rowCount = isLoading ? cellCount + 1 : cellCount;

    return (
      <JuiVirtualListWrapper>
        <InfiniteLoader
          rowCount={rowCount}
          isRowLoaded={this.isRowLoaded}
          loadMoreRows={this.loadMore}
        >
          {({ onRowsRendered, registerChild }) => (
            <AutoSizer>
              {({ width, height }) => (
                <List
                  overscanRowCount={20}
                  rowCount={rowCount}
                  width={width}
                  height={height}
                  rowHeight={this._rowHeight}
                  noRowsRenderer={noRowsRenderer}
                  ref={(virtualScroll: any) => {
                    this.virtualScroll = virtualScroll;
                    registerChild(virtualScroll);
                  }}
                  onRowsRendered={onRowsRendered}
                  rowRenderer={this.rowRenderer}
                />
              )}
            </AutoSizer>
          )}
        </InfiniteLoader>
      </JuiVirtualListWrapper>
    );
  }
}

export { JuiInfiniteList };
