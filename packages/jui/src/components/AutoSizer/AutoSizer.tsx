/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-03-14 11:04:40
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import ReactResizeDetector from 'react-resize-detector';

type Size = {
  width: number;
  height: number;
};

type AutoSizerProps = {
  handleWidth?: boolean;
  handleHeight?: boolean;
  style?: React.CSSProperties;
  children: (size: Partial<Size>) => React.ReactNode;
};

const AutoSizer = ({
  handleWidth,
  handleHeight,
  style,
  children,
}: AutoSizerProps) => (
  <ReactResizeDetector handleWidth={handleWidth} handleHeight={handleHeight}>
    {(size: Partial<Size>) => <div style={style}>{children(size)}</div>}
  </ReactResizeDetector>
);

export { AutoSizer, AutoSizerProps, Size };
