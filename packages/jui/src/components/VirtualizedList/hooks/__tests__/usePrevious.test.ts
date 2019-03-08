/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-03-08 12:22:49
 * Copyright © RingCentral. All rights reserved.
 */
import { useState } from 'react';
import { act } from 'react-dom/test-utils';
import { renderHook } from '../../../../__tests__/renderHook';
import { usePrevious } from '../usePrevious';

const setup = <T>(initialValue: T) => {
  return renderHook(() => {
    const [value, setValue] = useState<T>(initialValue);
    const prevValue = usePrevious(() => value);
    return { value, prevValue, setValue };
  });
};

describe('usePrevious()', () => {
  it('should be null when it was rendered first time', () => {
    const hookRef = setup(0);
    expect(hookRef.current.prevValue).toEqual(null);
  });

  it('should always get previous value', () => {
    const hookRef = setup<number | string | boolean | object>(0);

    act(() => hookRef.current.setValue('a'));
    expect(hookRef.current.prevValue).toBe(0);

    act(() => hookRef.current.setValue(true));
    expect(hookRef.current.prevValue).toBe('a');

    act(() => hookRef.current.setValue({}));
    expect(hookRef.current.prevValue).toBe(true);

    act(() => hookRef.current.setValue(0));
    expect(hookRef.current.prevValue).toEqual({});
  });
});
