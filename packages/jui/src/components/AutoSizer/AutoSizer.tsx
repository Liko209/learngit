/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-03-14 11:04:40
 * Copyright © RingCentral. All rights reserved.
 */
import React, { useLayoutEffect, useState, useRef } from 'react';
import styled from '../../foundation/styled-components';
import ResizeObserver from 'resize-observer-polyfill';

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
  height: 100%;
  max-height: 100%;
  min-height: inherit;
  display: flex;
  flex-direction: column;
`;

const JuiAutoSizer = ({
  defaultWidth,
  defaultHeight,
  children,
}: JuiAutoSizerProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [{ width, height }, setSize] = useState<Partial<Size>>({
    width: defaultWidth,
    height: defaultHeight,
  });

  const updateSize = () => {
    if (ref.current) {
      const { offsetWidth, offsetHeight } = ref.current;
      const computedStyle = getComputedStyle(ref.current);
      const paddingTop = parseInt(computedStyle.paddingTop || '0', 10);
      const paddingBottom = parseInt(computedStyle.paddingBottom || '0', 10);
      setSize({
        width: offsetWidth,
        height: offsetHeight - paddingTop - paddingBottom,
      });
    }
  };

  useLayoutEffect(() => {
    if (!ref.current) return;

    if (ref.current.parentElement) {
      ref.current.parentElement.style.display = 'flex';
      ref.current.parentElement.style.flexDirection = 'column';
    }

    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(ref.current);

    return () => {
      observer.disconnect();
    };
  }, []);
  return <Wrapper ref={ref as any}>{children({ width, height })}</Wrapper>;
};

JuiAutoSizer.defaultProps = {
  defaultWidth: 200,
  defaultHeight: 200,
};

export { JuiAutoSizer, JuiAutoSizerProps, Size };
