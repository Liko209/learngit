/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-03-05 15:35:27
 * Copyright © RingCentral. All rights reserved.
 */
import React, { useState } from 'react';
import { noop } from '../../foundation/utils';
import { JuiDataLoader } from './DataLoader';
import { JuiVirtualizedList } from './VirtualizedList';
import { IndexRange } from './VirtualizedListProps';

type JuiInfiniteListProps = {
  height: number;
  minRowHeight: number;
  overscan?: number;
  hasMore: (direction: 'up' | 'down') => boolean;
  loadInitialData: () => Promise<void>;
  loadMore: (direction: 'up' | 'down') => Promise<void>;
  initialScrollToIndex: number;
  onVisibleRangeChange?: (range: IndexRange) => void;
  onRenderedRangeChange?: (range: IndexRange) => void;
  noRowsRenderer: JSX.Element;
  loadingRenderer: JSX.Element;
  loadingMoreRenderer: JSX.Element;
  children: JSX.Element[];
  stickToBottom?: boolean;
};

const JuiInfiniteList = ({
  height,
  minRowHeight,
  overscan,
  hasMore,
  loadInitialData,
  loadMore,
  initialScrollToIndex,
  noRowsRenderer,
  loadingRenderer,
  loadingMoreRenderer,
  onVisibleRangeChange,
  onRenderedRangeChange,
  stickToBottom,
  children,
}: JuiInfiniteListProps) => {
  const [isStickToBottomEnabled, enableStickToBottom] = useState(true);

  const _loadMore = async (direction: 'up' | 'down') => {
    enableStickToBottom(false);
    await loadMore(direction);
    enableStickToBottom(true);
  };

  return (
    <JuiDataLoader
      hasMore={hasMore}
      loadInitialData={loadInitialData}
      loadMore={_loadMore}
    >
      {({ ref, onScroll, loadingInitial, loadingUp, loadingDown }) => {
        if (loadingInitial) {
          return loadingRenderer;
        }

        const isEmpty =
          children.length === 0 && !hasMore('up') && !hasMore('down');
        if (isEmpty) {
          return noRowsRenderer;
        }
        return (
          <JuiVirtualizedList
            ref={ref}
            height={height}
            minRowHeight={minRowHeight}
            initialScrollToIndex={initialScrollToIndex}
            overscan={overscan}
            before={loadingUp ? loadingMoreRenderer : null}
            after={loadingDown ? loadingMoreRenderer : null}
            onScroll={onScroll}
            onVisibleRangeChange={onVisibleRangeChange}
            onRenderedRangeChange={onRenderedRangeChange}
            stickToBottom={stickToBottom && isStickToBottomEnabled}
          >
            {children}
          </JuiVirtualizedList>
        );
      }}
    </JuiDataLoader>
  );
};

JuiInfiniteList.defaultProps = {
  initialScrollToIndex: 0,
  onVisibleRangeChange: noop,
};

export { JuiInfiniteList, JuiInfiniteListProps };
