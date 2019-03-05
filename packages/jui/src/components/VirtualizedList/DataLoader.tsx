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

  useEffect(() => {
    _loadInitialData();
  },        []);

  const _loadInitialData = async () => {
    setLoadingInitial(true);
    await loadInitialData();
    setLoadingInitial(false);
  };

  const _loadMoreUp = async () => {
    setLoadingUp(true);
    await loadMore('up');
    setLoadingUp(false);
  };

  const _loadMoreDown = async () => {
    setLoadingDown(true);
    await loadMore('down');
    setLoadingDown(false);
  };

  const handleScroll = ({ currentTarget }: React.UIEvent) => {
    const { scrollTop, scrollHeight, clientHeight } = currentTarget;
    const atTop = 0 === scrollTop;
    const atBottom = scrollHeight === scrollTop + clientHeight;
    const direction = scrollTop - prevScrollTopRef.current > 0 ? 'down' : 'up';

    if (loadingUp) {
      return;
    }

    if (atTop && direction === 'up') {
      if (hasMore('up')) {
        _loadMoreUp();
      }
    } else if (atBottom && direction === 'down') {
      if (hasMore('down')) {
        _loadMoreDown();
      }
    }

    prevScrollTopRef.current = currentTarget.scrollTop;
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
