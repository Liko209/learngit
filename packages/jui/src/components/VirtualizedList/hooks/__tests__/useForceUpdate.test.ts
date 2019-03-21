/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-03-08 11:01:46
 * Copyright © RingCentral. All rights reserved.
 */
import { act } from 'react-dom/test-utils';
import { renderHook } from '../../../../__tests__/renderHook';
import { useForceUpdate } from '../useForceUpdate';

describe('useForceUpdate()', () => {
  it('should return different update trigger every time', () => {
    const hookRef = renderHook(() => useForceUpdate());

    let prevTrigger = hookRef.current.updateTrigger;
    act(() => hookRef.current.forceUpdate());
    expect(prevTrigger).not.toBe(hookRef.current.updateTrigger);

    prevTrigger = hookRef.current.updateTrigger;
    act(() => hookRef.current.forceUpdate());
    expect(prevTrigger).not.toBe(hookRef.current.updateTrigger);
  });
});
