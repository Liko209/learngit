/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-02-28 14:59:38
 * Copyright © RingCentral. All rights reserved.
 */
type JuiVirtualizedListProps = {
  height: number;
  initialScrollToIndex: number;
  initialRangeSize: number;
  onScroll: (event: React.UIEvent) => void;
  before?: React.ReactNode;
  after?: React.ReactNode;
  children: JSX.Element[];
};

export { JuiVirtualizedListProps };
