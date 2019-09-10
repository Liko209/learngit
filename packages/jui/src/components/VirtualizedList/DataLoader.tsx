/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-03-04 10:14:48
 * Copyright © RingCentral. All rights reserved.
 */
import _ from 'lodash';
import { useRef, useState, useEffect, memo, useCallback } from 'react';
import { useMountState } from './hooks';
import { noop } from '../../foundation/utils';
import { ILoadMoreStrategy } from './LoadMoreStrategy/ILoadMoreStrategy';
import { IndexRange, IndexConstraint, Delta } from './types';
import { DIRECTION } from '../Lists';

type JuiDataLoaderProps = {
  threshold?: number;
  loadMore: (direction: DIRECTION, count: number) => Promise<void>;
  loadInitialData: () => Promise<void>;
  hasMore: (direction: DIRECTION) => boolean;
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
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [loadingInitialFailed, setLoadingInitialFailed] = useState(false);
  const loading = loadingUp || loadingDown || loadingInitial;
  const isMountedRef = useMountState();

  const getMap = useCallback(
    () => ({
      up: {
        setLoading: setLoadingUp,
        load: (count: number) => loadMore(DIRECTION.UP, count),
        onFailed: noop,
      },
      down: {
        setLoading: setLoadingDown,
        load: (count: number) => loadMore(DIRECTION.DOWN, count),
        onFailed: noop,
      },
      initial: {
        setLoading: setLoadingInitial,
        load: () => loadInitialData(),
        onFailed: setLoadingInitialFailed,
      },
    }),
    [loadMore, loadInitialData],
  );

  const loadData = useCallback(
    _.throttle(async (type: 'initial' | 'up' | 'down', count: number = 10) => {
      if (!isMountedRef.current) {
        return;
      }
      let success: boolean = false;
      const map = getMap();
      const { setLoading, load, onFailed } = map[type];
      setLoading(true);
      onFailed(false);
      try {
        await load(count);
        success = true;
      } catch {
        isMountedRef.current && onFailed(true);
        success = false;
      } finally {
        isMountedRef.current && setLoading(false);
      }

      return success;
    }, 1000),
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
    [loadData, loadMoreStrategy, loading],
  );

  useEffect(() => {
    loadData('initial').then((result: boolean) => {
      if (result && isMountedRef.current) {
        const preloadInfo = loadMoreStrategy.getPreloadInfo();

        preloadInfo &&
          hasMore(preloadInfo.direction!) &&
          loadData(preloadInfo.direction!, preloadInfo.count);
      }
    });
  }, [loadInitialData]);

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
