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

type JuiAutoSizerProps = {
  handleWidth?: boolean;
  handleHeight?: boolean;
  style?: React.CSSProperties;
  children: (size: Partial<Size>) => React.ReactNode;
};

const JuiAutoSizer = ({
  handleWidth,
  handleHeight,
  style,
  children,
}: JuiAutoSizerProps) => (
  <ReactResizeDetector handleWidth={handleWidth} handleHeight={handleHeight}>
    {(size: Partial<Size>) => <div style={style}>{children(size)}</div>}
  </ReactResizeDetector>
);

export { JuiAutoSizer, JuiAutoSizerProps, Size };
