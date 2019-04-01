/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-03-04 10:14:48
 * Copyright © RingCentral. All rights reserved.
 */
import { useRef, useState, useEffect, memo } from 'react';
import { noop } from '../../foundation/utils';
import { IndexRange } from './types';
import { ILoadMoreStrategy } from './LoadMoreStrategy/ILoadMoreStrategy';

type Direction = 'up' | 'down';

type IndexConstraint = {
  minIndex: number;
  maxIndex: number;
};

type JuiDataLoaderProps = {
  threshold?: number;
  loadMore: (direction: Direction, count: number) => Promise<void>;
  loadInitialData: () => Promise<void>;
  hasMore: (direction: Direction) => boolean;
  loadMoreStrategy: ILoadMoreStrategy;
  children: (params: {
    loadingInitial: boolean;
    loadingUp: boolean;
    loadingDown: boolean;
    loadingInitialFailed: boolean;
    onScroll: (range: IndexRange, constraint: IndexConstraint) => void;
  }) => JSX.Element | null | void;
};

const JuiDataLoader = ({
  hasMore,
  loadInitialData,
  loadMoreStrategy,
  loadMore,
  children,
}: JuiDataLoaderProps) => {
  const prevVisibleRangeRef = useRef({ startIndex: 0, stopIndex: 0 });
  const prevVisibleRangeTimeRef = useRef(Date.now());
  const [loadingUp, setLoadingUp] = useState(false);
  const [loadingDown, setLoadingDown] = useState(false);
  const [loadingInitial, setLoadingInitial] = useState(false);
  const [loadingInitialFailed, setLoadingInitialFailed] = useState(false);
  const loading = loadingUp || loadingDown || loadingInitial;

  const map = {
    up: {
      setLoading: setLoadingUp,
      load: (count: number) => loadMore('up', count),
      onFailed: noop,
    },
    down: {
      setLoading: setLoadingDown,
      load: (count: number) => loadMore('down', count),
      onFailed: noop,
    },
    initial: {
      setLoading: setLoadingInitial,
      load: () => loadInitialData(),
      onFailed: setLoadingInitialFailed,
    },
  };

  useEffect(() => {
    loadData('initial');
  },        []);

  const loadData = async (
    type: 'initial' | 'up' | 'down',
    count: number = 10,
  ) => {
    const { setLoading, load, onFailed } = map[type];
    setLoading(true);
    onFailed(false);
    try {
      await load(count);
    } catch {
      onFailed(true);
    }
    setLoading(false);
  };

  const handleScroll = (
    visibleRange: Readonly<IndexRange>,
    indexConstraint: IndexConstraint,
  ) => {
    if (loading) {
      return;
    }

    const { direction, count } = loadMoreStrategy.getLoadMoreInfo({
      ...indexConstraint,
      visibleRange,
      prevVisibleRange: prevVisibleRangeRef.current,
      prevVisibleRangeTime: prevVisibleRangeTimeRef.current,
    });
    prevVisibleRangeRef.current = visibleRange;
    prevVisibleRangeTimeRef.current = Date.now();

    if (direction && count > 0 && hasMore(direction)) {
      loadData(direction, count);
    }
  };

  const childrenElement = children({
    loadingInitial,
    loadingUp,
    loadingDown,
    loadingInitialFailed,
    onScroll: handleScroll,
  });
  return childrenElement || null;
};

const MemoDataLoader = memo(JuiDataLoader);
export { MemoDataLoader as JuiDataLoader, JuiDataLoaderProps };
