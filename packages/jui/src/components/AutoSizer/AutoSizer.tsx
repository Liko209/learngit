/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-03-14 11:04:40
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import styled from '../../foundation/styled-components';
import { JuiSizeMeasurer } from '../SizeMeasurer';

type Size = {
  width: number;
  height: number;
};
type JuiAutoSizerProps = {
  defaultWidth?: number;
  defaultHeight?: number;
  children: (size: Partial<Size>) => React.ReactNode;
};

const Wrapper = styled.div`
  height: inherit;
  min-height: inherit;
  max-height: inherit;
`;

const JuiAutoSizer = ({
  defaultWidth,
  defaultHeight,
  children,
}: JuiAutoSizerProps) => {
  return (
    <JuiSizeMeasurer>
      {({ width = defaultWidth, height = defaultHeight, ref }) => (
        <Wrapper ref={ref as any}>{children({ width, height })}</Wrapper>
      )}
    </JuiSizeMeasurer>
  );
};

JuiAutoSizer.defaultProps = {
  defaultWidth: 200,
  defaultHeight: 200,
};

export { JuiAutoSizer, JuiAutoSizerProps, Size };
