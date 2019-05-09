/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-02-28 14:59:38
 * Copyright © RingCentral. All rights reserved.
 */

type Direction = 'up' | 'down';

type IndexRange = {
  startIndex: number;
  stopIndex: number;
};

type IndexConstraint = {
  minIndex: number;
  maxIndex: number;
};

type Delta = { x: number; y: number; z: number };

type JuiVirtualizedListProps = {
  initialScrollToIndex?: number;
  onScroll?: (event: React.UIEvent<HTMLElement>) => void;
  onWheel?: (event: React.WheelEvent<HTMLElement>) => void;
  onVisibleRangeChange?: (range: IndexRange) => void;
  onRenderedRangeChange?: (range: IndexRange) => void;
  before?: React.ReactNode;
  after?: React.ReactNode;
  height: number;
  minRowHeight: number;
  overscan?: number;
  stickToBottom?: boolean;
  children: JSX.Element[];
  contentStyle?: React.CSSProperties;
  stickToLastPosition?: boolean;
  fixedWrapper?: boolean;
};

export {
  JuiVirtualizedListProps,
  IndexRange,
  IndexConstraint,
  Direction,
  Delta,
};
