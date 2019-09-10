/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-08-29 15:00:26
 * Copyright © RingCentral. All rights reserved.
 */
import { useRef } from 'react';
import { shallowEqual } from '../../utils/shallowEqual';

const useShallowDependency = <T = any>(value: T) => {
  const ref = useRef<T>();
  if (!shallowEqual(value, ref.current)) {
    ref.current = value;
  }
  return ref.current;
};

export { useShallowDependency };
