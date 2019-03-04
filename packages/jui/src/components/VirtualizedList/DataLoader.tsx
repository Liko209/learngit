/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-03-04 10:14:48
 * Copyright © RingCentral. All rights reserved.
 */
import React, { useRef, useState } from 'react';
import { IDataSource, Direction } from './IDataSource';

type DataLoaderProps = {
  loadMore: (direction: Direction) => Promise<void>;
  loadInitialData: () => Promise<void>;
  hasMore: (direction: Direction) => boolean;
  children: (params: {
    ref: React.RefObject<any>;
    loadingUp: boolean;
    onScroll: (event: React.UIEvent) => void;
  }) => JSX.Element;
};

const JuiDataLoader = ({ hasMore, loadMore, children }: DataLoaderProps) => {
  const ref = React.createRef();
  const prevScrollTopRef = useRef(0);
  const [loadingUp, setLoadingUp] = useState(false);

  const handleScroll = async ({ currentTarget }: React.UIEvent) => {
    const { scrollTop, scrollHeight, clientHeight } = currentTarget;
    const atTop = 0 === scrollTop;
    const atBottom = scrollHeight === scrollTop + clientHeight;
    const direction = scrollTop - prevScrollTopRef.current > 0 ? 'down' : 'up';

    console.log(atTop);
    console.log('direction: ', direction);

    if (loadingUp) {
    }

    if (atTop && direction === 'up') {
      if (hasMore('up')) {
        setLoadingUp(true);
        await loadMore('up');
        setLoadingUp(false);
      }
    } else if (atBottom && direction === 'down') {
      if (hasMore('down')) {
        loadMore('down');
      }
    }

    prevScrollTopRef.current = currentTarget.scrollTop;
  };
  return children({ ref, loadingUp, onScroll: handleScroll });
};

export { JuiDataLoader, IDataSource };
