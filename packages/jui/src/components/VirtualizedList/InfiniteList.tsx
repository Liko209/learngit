/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-03-05 15:35:27
 * Copyright © RingCentral. All rights reserved.
 */
import React, {
  useState,
  createRef,
  useImperativeHandle,
  RefForwardingComponent,
  memo,
  forwardRef,
} from 'react';
import { noop } from '../../foundation/utils';
import { JuiDataLoader } from './DataLoader';
import { JuiVirtualizedList } from './VirtualizedList';
import { IndexRange } from './types';

type JuiInfiniteListProps = {
  height?: number;
  minRowHeight: number;
  overscan?: number;
  hasMore: (direction: 'up' | 'down') => boolean;
  loadInitialData: () => Promise<void>;
  loadMore: (direction: 'up' | 'down') => Promise<void>;
  initialScrollToIndex?: number;
  onVisibleRangeChange?: (range: IndexRange) => void;
  onRenderedRangeChange?: (range: IndexRange) => void;
  noRowsRenderer?: JSX.Element;
  loadingRenderer: JSX.Element;
  loadingMoreRenderer: JSX.Element;
  children: JSX.Element[];
  stickToBottom?: boolean;
  fallBackRenderer?: JSX.Element;
  classWhenUnScrollable?: string;
  classWhenScrollable?: string;
};

const JuiInfiniteList: RefForwardingComponent<
  { ref: any },
  JuiInfiniteListProps
> = (
  {
    height,
    minRowHeight,
    overscan,
    hasMore,
    loadInitialData,
    loadMore,
    initialScrollToIndex = 0,
    noRowsRenderer,
    loadingRenderer,
    loadingMoreRenderer,
    onVisibleRangeChange = noop,
    onRenderedRangeChange,
    stickToBottom,
    fallBackRenderer,
    children,
    classWhenUnScrollable,
    classWhenScrollable,
  }: JuiInfiniteListProps,
  forwardRef,
) => {
  const ref = createRef() as any;

  const [isStickToBottomEnabled, enableStickToBottom] = useState(true);

  const _loadMore = async (direction: 'up' | 'down') => {
    enableStickToBottom(false);
    await loadMore(direction);
    enableStickToBottom(true);
  };
  useImperativeHandle(forwardRef, () => ({
    ref: ref.current ? ref.current.ref : null,
  }));
  console.log('andy hu height', height);
  return (
    <JuiDataLoader
      hasMore={hasMore}
      loadInitialData={loadInitialData}
      loadMore={_loadMore}
      ref={ref}
    >
      {({
        ref,
        onScroll,
        loadingInitial,
        loadingUp,
        loadingDown,
        loadingInitialFailed,
      }) => {
        if (loadingInitial || !height) {
          return loadingRenderer;
        }
        if (loadingInitialFailed) {
          return fallBackRenderer || <></>;
        }

        const isEmpty =
          children.length === 0 && !hasMore('up') && !hasMore('down');
        if (isEmpty && noRowsRenderer) {
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
            classWhenUnScrollable={classWhenScrollable}
            classWhenScrollable={classWhenScrollable}
          >
            {children}
          </JuiVirtualizedList>
        );
      }}
    </JuiDataLoader>
  );
};

const memoInfiniteList = memo(
  forwardRef(JuiInfiniteList),
) as React.MemoExoticComponent<
  React.ForwardRefExoticComponent<
    JuiInfiniteListProps & React.RefAttributes<{ ref: any }>
  >
>;
export { memoInfiniteList as JuiInfiniteList, JuiInfiniteListProps };
