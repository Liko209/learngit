import { MouseEvent } from 'react';

type InfiniteListDemoProps = {};

type InfiniteListDemoViewProps = {
  onScrollTop(event: MouseEvent): void;
  onScrollBottom(event: MouseEvent): void;
};

export { InfiniteListDemoProps, InfiniteListDemoViewProps };
