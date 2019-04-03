/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-03-04 10:14:48
 * Copyright © RingCentral. All rights reserved.
 */
import React, { useRef, useState, useEffect, memo } from 'react';
import { noop } from '../../foundation/utils';

type Direction = 'up' | 'down';

type JuiDataLoaderProps = {
  loadMore: (direction: Direction) => Promise<void>;
  loadInitialData: () => Promise<void>;
  hasMore: (direction: Direction) => boolean;
  children: (params: {
    loadingInitial: boolean;
    loadingUp: boolean;
    loadingDown: boolean;
    loadingInitialFailed: boolean;
    onScroll: (event: React.UIEvent) => void;
  }) => JSX.Element | null | void;
};

const JuiDataLoader = ({
  hasMore,
  loadInitialData,
  loadMore,
  children,
}: JuiDataLoaderProps) => {
  const prevScrollTopRef = useRef(0);
  const [loadingUp, setLoadingUp] = useState(false);
  const [loadingDown, setLoadingDown] = useState(false);
  const [loadingInitial, setLoadingInitial] = useState(false);
  const [loadingInitialFailed, setLoadingInitialFailed] = useState(false);
  const loading = loadingUp || loadingDown || loadingInitial;

  const map = {
    up: {
      setLoading: setLoadingUp,
      load: () => loadMore('up'),
      onFailed: noop,
    },
    down: {
      setLoading: setLoadingDown,
      load: () => loadMore('down'),
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

  const loadData = async (type: 'initial' | 'up' | 'down') => {
    const { setLoading, load, onFailed } = map[type];
    setLoading(true);
    onFailed(false);
    try {
      await load();
    } catch {
      onFailed(true);
    }
    setLoading(false);
  };

  const handleScroll = ({ currentTarget }: React.UIEvent) => {
    if (loading) {
      return;
    }

    const { scrollTop, scrollHeight, clientHeight } = currentTarget;
    const atTop = 0 === scrollTop;
    const atBottom = scrollHeight === scrollTop + clientHeight;
    const scrollTopDiff = Math.floor(scrollTop - prevScrollTopRef.current);

    prevScrollTopRef.current = currentTarget.scrollTop;

    if (atTop && scrollTopDiff < 0) {
      if (hasMore('up')) {
        loadData('up');
      }
    } else if (atBottom && scrollTopDiff > 0) {
      if (hasMore('down')) {
        loadData('down');
      }
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
