/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-03-14 14:50:12
 * Copyright © RingCentral. All rights reserved.
 */
import React, { useLayoutEffect, useState, useRef } from 'react';
import ResizeObserver from 'resize-observer-polyfill';

type Size = {
  width: number;
  height: number;
};

type JuiSizeMeasurerProps = {
  children: (
    size: Partial<Size> & { ref: React.RefObject<HTMLElement> },
  ) => any;
};

const JuiSizeMeasurer = ({ children }: JuiSizeMeasurerProps) => {
  const ref = useRef<HTMLElement>(null);
  const [{ width, height }, setSize] = useState<Partial<Size>>({
    width: undefined,
    height: undefined,
  });

  const updateSize = () => {
    if (ref.current) {
      const { offsetWidth, offsetHeight } = ref.current;
      setSize({
        width: offsetWidth,
        height: offsetHeight,
      });
    }
  };

  useLayoutEffect(() => {
    if (!ref.current) return;

    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(ref.current);

    return () => {
      observer.disconnect();
    };
  },              []);

  return children({ ref, width, height });
};

export { JuiSizeMeasurer, JuiSizeMeasurerProps };
