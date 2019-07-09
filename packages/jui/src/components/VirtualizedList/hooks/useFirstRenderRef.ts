/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-02-28 15:01:09
 * Copyright © RingCentral. All rights reserved.
 */
import { useLayoutEffect, useRef } from 'react';

const useIsFirstRenderRef = () => {
  const ref = useRef(true);
  useLayoutEffect(() => {
    setTimeout(() => {
      ref.current = false;
    });
  }, []);
  return ref;
};

export { useIsFirstRenderRef };
