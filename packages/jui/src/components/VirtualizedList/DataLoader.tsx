/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-03-04 10:14:48
 * Copyright © RingCentral. All rights reserved.
 */
import _ from 'lodash';
import { useRef, useState, useEffect, memo, useCallback } from 'react';
import { noop } from '../../foundation/utils';
import { ILoadMoreStrategy } from './LoadMoreStrategy/ILoadMoreStrategy';
import { IndexRange, Direction, IndexConstraint, Delta } from './types';

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
    onScroll: (
      range: IndexRange,
      prevRange: IndexRange,
      constraint: IndexConstraint,
      delta?: Delta,
    ) => void;
  }) => JSX.Element | null | void;
};

const JuiDataLoader = ({
  hasMore,
  loadInitialData,
  loadMoreStrategy,
  loadMore,
  children,
}: JuiDataLoaderProps) => {
  const prevVisibleRangeTimeRef = useRef(Date.now());
  const [loadingUp, setLoadingUp] = useState(false);
  const [loadingDown, setLoadingDown] = useState(false);
  const [loadingInitial, setLoadingInitial] = useState(false);
  const [loadingInitialFailed, setLoadingInitialFailed] = useState(false);
  const loading = loadingUp || loadingDown || loadingInitial;

  const getMap = useCallback(() => {
    return {
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
  },                         [loadMore, loadMore, loadInitialData]);

  const loadData = useCallback(
    _.throttle(async (type: 'initial' | 'up' | 'down', count: number = 10) => {
      const map = getMap();
      const { setLoading, load, onFailed } = map[type];
      setLoading(true);
      onFailed(false);
      try {
        await load(count);
      } catch {
        onFailed(true);
      }
      setLoading(false);
    },         1000),
    [getMap],
  );

  const handleScroll = useCallback(
    (
      visibleRange: Readonly<IndexRange>,
      prevVisibleRange: Readonly<IndexRange>,
      indexConstraint: IndexConstraint,
      delta?: Delta,
    ) => {
      if (loading) {
        return;
      }

      const { direction, count } = loadMoreStrategy.getLoadMoreInfo({
        indexConstraint,
        delta,
        visibleRange,
        prevVisibleRange,
        prevVisibleRangeTime: prevVisibleRangeTimeRef.current,
      });
      prevVisibleRangeTimeRef.current = Date.now();

      if (direction && count > 0 && hasMore(direction)) {
        loadData(direction, count);
      }
    },
    [loadData, loadMoreStrategy],
  );

  useEffect(() => {
    loadData('initial');
  },        []);

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
export { MemoDataLoader as JuiDataLoader, JuiDataLoaderProps, Delta };
