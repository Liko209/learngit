/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-03-05 15:35:27
 * Copyright © RingCentral. All rights reserved.
 */
import React, { useState } from 'react';
import { JuiDataLoader } from './DataLoader';
import { JuiVirtualizedList } from './VirtualizedList';

type JuiInfiniteListProps = {
  height: number;
  hasMore: (direction: 'up' | 'down') => boolean;
  loadInitialData: () => Promise<void>;
  loadMore: (direction: 'up' | 'down') => Promise<void>;
  initialScrollToIndex: number;
  noRowsRenderer: JSX.Element;
  loadingRenderer: JSX.Element;
  loadingMoreRenderer: JSX.Element;
  children: JSX.Element[];
  stickToBottom?: boolean;
};

const JuiInfiniteList = ({
  height,
  hasMore,
  loadInitialData,
  loadMore,
  initialScrollToIndex,
  noRowsRenderer,
  loadingRenderer,
  loadingMoreRenderer,
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
            initialScrollToIndex={initialScrollToIndex}
            onScroll={onScroll}
            height={height}
            before={loadingUp ? loadingMoreRenderer : null}
            after={loadingDown ? loadingMoreRenderer : null}
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
};

export { JuiInfiniteList, JuiInfiniteListProps };
