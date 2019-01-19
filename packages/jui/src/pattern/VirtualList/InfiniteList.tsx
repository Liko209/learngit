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
  ScrollEventData,
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
  scrollToRow?: number;
  renderLoading: () => ReactNode;
  cellCount: number;
  reverse?: boolean;
  scrollRef?: (ref: any) => void;
};

type State = {
  scrollToBottom: boolean;
};

class JuiInfiniteList extends Component<InfiniteScrollProps, State> {
  static defaultProps = {
    isLoading: false,
    reverse: false,
  };
  private virtualScroll: List;
  private scrollHeight: number;
  constructor(props: InfiniteScrollProps) {
    super(props);
    this.state = {
      scrollToBottom: true,
    };
    this.scrollHeight = 0;
  }

  private _rowHeight = ({ index }: Index) => this.props.rowHeight(index);

  loadMore = async ({ startIndex, stopIndex }: IndexRange) => {
    const { isLoading, loadMore } = this.props;
    if (!isLoading) {
      loadMore(startIndex, stopIndex);
    }
  }

  isRowLoaded = ({ index }: Index) => {
    const { reverse, cellCount, threshold } = this.props;
    const loaded =
      (reverse ? cellCount - 1 - index : index) < cellCount - threshold;
    return loaded;
  }

  onScroll = ({ clientHeight, scrollHeight, scrollTop }: ScrollEventData) => {
    if (!this.props.reverse) {
      return;
    }

    // Keep track of scroll height
    this.scrollHeight = scrollHeight;

    // Check whether initial scroll to bottom in reverse mode has completed
    if (
      this.state.scrollToBottom &&
      scrollTop === scrollHeight - clientHeight
    ) {
      this.setState({ scrollToBottom: false });
    }
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

  componentWillReceiveProps(newProps: InfiniteScrollProps) {
    // Scroll to bottom on initial data in reverse mode only
    const { reverse, cellCount } = this.props;
    if (reverse && cellCount !== newProps.cellCount) {
      this.setState({ scrollToBottom: true });
    }
  }

  componentDidUpdate(prevProps: InfiniteScrollProps, prevState: State) {
    const { reverse, cellCount, isLoading } = this.props;
    if (!reverse) {
      return;
    }

    // Re-measure all estimated rows if data has changed or loading is displayed
    if (
      prevProps.cellCount !== cellCount ||
      prevProps.isLoading !== isLoading
    ) {
      this.virtualScroll.measureAllRows();
    }

    // Get total size directly from the grid (which is updated by measureAllRows())
    const totalSize = (this.virtualScroll!.Grid!
      .state as any).instanceProps.rowSizeAndPositionManager.getTotalSize();

    // Get the DOM node for the virtual scroll
    const virtualScroll = ReactDOM.findDOMNode(this.virtualScroll) as Element;

    // With a valid scroll height and as long as we do not need to scroll to bottom
    if (virtualScroll && totalSize && !prevState.scrollToBottom) {
      // If the scroll height has changed, adjust the scroll position accordingly
      if (this.scrollHeight !== totalSize) {
        virtualScroll.scrollTop += totalSize - this.scrollHeight;
        this.scrollHeight = totalSize;
      }
    }
  }

  rowRenderer = ({ index, style }: ListRowProps) => {
    const {
      reverse,
      isLoading,
      cellCount,
      renderRow,
      renderLoading,
    } = this.props;
    if (reverse) {
      // Data needs to be rendered in reverse order, check for loading
      if (isLoading) {
        // Data is shifted down by 1 while loading
        if (index >= 1 && index < cellCount + 1) {
          return renderRow(cellCount - index, style);
        }

        return (
          <div key={-1} style={style}>
            {renderLoading()}
          </div>
        );
      }

      return renderRow(cellCount - 1 - index, style);
    }

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
    const { isLoading, cellCount, scrollToRow, reverse } = this.props;
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
                  scrollToIndex={
                    reverse
                      ? rowCount -
                        1 -
                        (this.state.scrollToBottom ? 0 : scrollToRow || 0)
                      : scrollToRow
                  }
                  height={height}
                  rowHeight={this._rowHeight}
                  ref={(virtualScroll: any) => {
                    this.virtualScroll = virtualScroll;
                    registerChild(virtualScroll);
                  }}
                  onRowsRendered={onRowsRendered}
                  rowRenderer={this.rowRenderer}
                  onScroll={this.onScroll}
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
