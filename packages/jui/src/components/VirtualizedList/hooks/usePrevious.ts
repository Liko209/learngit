/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-03-07 17:28:24
 * Copyright © RingCentral. All rights reserved.
 */
import { useRef, useEffect } from 'react';

function usePrevious<T>(getCurrent: () => T) {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    ref.current = getCurrent();
  });

  return ref.current;
}

export { usePrevious };
