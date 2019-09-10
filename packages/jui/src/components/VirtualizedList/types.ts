/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-02-28 14:59:38
 * Copyright © RingCentral. All rights reserved.
 */

enum Direction {
  'UP' = 'up',
  'DOWN' = 'down',
}

type UndefinedAble<T> = T | undefined;

type IndexRange = {
  startIndex: number;
  stopIndex: number;
};
type ScrollInfo = {
  scrollTop: number;
  clientHeight: number;
  scrollHeight: number;
};

type IndexConstraint = {
  minIndex: number;
  maxIndex: number;
};

type Delta = { x: number; y: number; z: number };

type VirtualizedListChild = JSX.Element | { key: string | number; type?: any };
enum SCROLL_ALIGN {
  TOP = 'top',
  BOTTOM = 'bottom',
}
type JuiVirtualizedListProps = {
  role?: string;
  tabIndex?: number;
  height: number;
  minRowHeight?: number;
  fixedRowHeight?: number;
  overscan?: number;
  initialScrollToIndex?: number;
  initialScrollAlignTo?: SCROLL_ALIGN;
  stickToBottom?: boolean;
  onScroll?: (event: React.UIEvent<HTMLElement>) => void;
  onWheel?: (event: React.WheelEvent<HTMLElement>) => void;
  onKeyDown?: (event: React.KeyboardEvent<HTMLElement>) => void;
  onVisibleRangeChange?: (range: IndexRange, scrollInfo: ScrollInfo) => void;
  onRenderedRangeChange?: (range: IndexRange) => void;
  before?: (() => JSX.Element) | null;
  after?: (() => JSX.Element) | null;
  children: VirtualizedListChild[];
  style?: React.CSSProperties;
  contentStyle?: React.CSSProperties;
  stickToLastPosition?: boolean;
  onBottomStatusChange?: (atBottom: boolean) => void;
  highlightedIndex?: number;
};

export {
  JuiVirtualizedListProps,
  VirtualizedListChild,
  IndexRange,
  IndexConstraint,
  Direction,
  Delta,
  UndefinedAble,
  ScrollInfo,
  SCROLL_ALIGN,
};
