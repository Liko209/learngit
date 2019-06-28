/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-02-28 14:59:38
 * Copyright © RingCentral. All rights reserved.
 */

type Direction = 'up' | 'down';

type UndefinedAble<T> = T | undefined;

type IndexRange = {
  startIndex: number;
  stopIndex: number;
};

type IndexConstraint = {
  minIndex: number;
  maxIndex: number;
};

type Delta = { x: number; y: number; z: number };

type VirtualizedListChild = JSX.Element | { key: string | number; type?: any };

type JuiVirtualizedListProps = {
  height: number;
  minRowHeight: number;
  overscan?: number;
  initialScrollToIndex?: number;
  stickToBottom?: boolean;
  onScroll?: (event: React.UIEvent<HTMLElement>) => void;
  onWheel?: (event: React.WheelEvent<HTMLElement>) => void;
  onVisibleRangeChange?: (range: IndexRange) => void;
  onRenderedRangeChange?: (range: IndexRange) => void;
  before?: React.ReactNode;
  after?: React.ReactNode;
  children: VirtualizedListChild[];
  style?: React.CSSProperties;
  contentStyle?: React.CSSProperties;
  stickToLastPosition?: boolean;
  onBottomStatusChange?: (atBottom: boolean) => void;
};

export {
  JuiVirtualizedListProps,
  VirtualizedListChild,
  IndexRange,
  IndexConstraint,
  Direction,
  Delta,
  UndefinedAble,
};
