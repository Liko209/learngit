/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-03-04 10:14:48
 * Copyright © RingCentral. All rights reserved.
 */
import React, {
  useRef,
  useState,
  useEffect,
  useImperativeHandle,
  RefForwardingComponent,
  memo,
  forwardRef,
} from 'react';
import { noop } from '../../foundation/utils';

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
    loadingInitialFailed: boolean;
    onScroll: (event: React.UIEvent) => void;
  }) => JSX.Element;
};
type ExoticProps = { ref: any };

const JuiDataLoader: RefForwardingComponent<ExoticProps, JuiDataLoaderProps> = (
  { hasMore, loadInitialData, loadMore, children }: JuiDataLoaderProps,
  forwardRef,
) => {
  const ref = React.createRef();
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

  useImperativeHandle(forwardRef, () => ({
    ref: ref.current,
  }));

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
    loadingInitialFailed,
    onScroll: handleScroll,
  });
};

const memoDataLoader = memo(
  forwardRef(JuiDataLoader),
) as React.MemoExoticComponent<
  React.ForwardRefExoticComponent<
    JuiDataLoaderProps & React.RefAttributes<ExoticProps>
  >
>;
export { memoDataLoader as JuiDataLoader, JuiDataLoaderProps };
