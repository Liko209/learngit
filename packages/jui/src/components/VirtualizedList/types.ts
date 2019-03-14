/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-02-28 14:59:38
 * Copyright © RingCentral. All rights reserved.
 */

type IndexRange = {
  startIndex: number;
  stopIndex: number;
};

type JuiVirtualizedListProps = {
  height: number;
  minRowHeight: number;
  overscan: number;
  initialScrollToIndex: number;
  stickToBottom?: boolean;
  onScroll: (event: React.UIEvent) => void;
  onVisibleRangeChange: (range: IndexRange) => void;
  onRenderedRangeChange: (range: IndexRange) => void;
  before?: React.ReactNode;
  after?: React.ReactNode;
  children: JSX.Element[];
  classWhenUnScrollable?: string;
  classWhenScrollable?: string;
};

export { JuiVirtualizedListProps, IndexRange };
