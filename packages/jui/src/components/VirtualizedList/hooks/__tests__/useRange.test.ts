/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-03-08 12:22:49
 * Copyright © RingCentral. All rights reserved.
 */
import { act } from 'react-dom/test-utils';
import { renderHook } from '../../../../__tests__/renderHook';
import { useRange } from '../useRange';

describe('useRange()', () => {
  it('should init range', () => {
    const initialRange = { startIndex: 0, stopIndex: 1 };
    const hookRef = renderHook(() => useRange(initialRange));
    expect(hookRef.current.range).toEqual(initialRange);
  });

  it('should update range', () => {
    const initialRange = { startIndex: 0, stopIndex: 1 };
    const newRange = { startIndex: 0, stopIndex: 10 };

    const hookRef = renderHook(() => useRange(initialRange));
    act(() => hookRef.current.setRange(newRange));
    expect(hookRef.current.range).toEqual(newRange);
  });
});
