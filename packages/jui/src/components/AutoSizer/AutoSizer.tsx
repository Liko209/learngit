/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-03-14 11:04:40
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import ReactResizeDetector from 'react-resize-detector';
import styled from '../../foundation/styled-components';
import { JuiSizeMeasurer } from '../SizeMeasurer';

type Size = {
  width: number;
  height: number;
};
type JuiAutoSizerProps = {
  children: (size: Partial<Size>) => React.ReactNode;
};

const Wrapper = styled.div`
  height: inherit;
  max-height: inherit;
`;

const DEFAULT_WIDTH = 200;
const DEFAULT_HEIGHT = 200;

const JuiAutoSizer = ({ children }: JuiAutoSizerProps) => {
  return (
    <JuiSizeMeasurer>
      {({ width = DEFAULT_WIDTH, height = DEFAULT_HEIGHT, ref }) => (
        <Wrapper ref={ref as any}>{children({ width, height })}</Wrapper>
      )}
    </JuiSizeMeasurer>
  );
};

export { JuiAutoSizer, JuiAutoSizerProps, Size };
