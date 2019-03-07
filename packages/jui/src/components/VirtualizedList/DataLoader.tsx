/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-03-04 10:14:48
 * Copyright © RingCentral. All rights reserved.
 */
import React, { useRef, useState, useEffect } from 'react';

type Direction = 'up' | 'down';

type JuiDataLoaderProps = {
  loadMore: (direction: Direction) => Promise<void>;
  loadInitialData: () => Promise<void>;
  hasMore: (direction: Direction) => boolean;
  children: (params: {
    ref: React.RefObject<any>;
    loadingInitial: boolean;
    loadingUp: boolean;
    loadingDown: boolean;
    onScroll: (event: React.UIEvent) => void;
  }) => JSX.Element;
};

const JuiDataLoader = ({
  hasMore,
  loadInitialData,
  loadMore,
  children,
}: JuiDataLoaderProps) => {
  const ref = React.createRef();
  const prevScrollTopRef = useRef(0);
  const [loadingUp, setLoadingUp] = useState(false);
  const [loadingDown, setLoadingDown] = useState(false);
  const [loadingInitial, setLoadingInitial] = useState(false);
  const loading = loadingUp || loadingDown || loadingInitial;

  const map = {
    up: {
      setLoading: setLoadingUp,
      load: () => loadMore('up'),
    },
    down: {
      setLoading: setLoadingDown,
      load: () => loadMore('down'),
    },
    initial: {
      setLoading: setLoadingInitial,
      load: () => loadInitialData(),
    },
  };

  useEffect(() => {
    loadData('initial');
  },        []);

  const loadData = async (type: 'initial' | 'up' | 'down') => {
    const { setLoading, load } = map[type];
    setLoading(true);
    await load();
    setLoading(false);
  };

  const handleScroll = ({ currentTarget }: React.UIEvent) => {
    if (loading) {
      return;
    }

    const { scrollTop, scrollHeight, clientHeight } = currentTarget;
    const atTop = 0 === scrollTop;
    const atBottom = scrollHeight === scrollTop + clientHeight;
    const direction = scrollTop - prevScrollTopRef.current > 0 ? 'down' : 'up';
    prevScrollTopRef.current = currentTarget.scrollTop;

    if (atTop && direction === 'up') {
      if (hasMore('up')) {
        loadData('up');
      }
    } else if (atBottom && direction === 'down') {
      if (hasMore('down')) {
        loadData('down');
      }
    }
  };

  return children({
    ref,
    loadingInitial,
    loadingUp,
    loadingDown,
    onScroll: handleScroll,
  });
};

export { JuiDataLoader, JuiDataLoaderProps };
