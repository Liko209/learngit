/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-03-08 12:22:49
 * Copyright © RingCentral. All rights reserved.
 */
import { act } from 'react-dom/test-utils';
import { renderHook } from '../../../../__tests__/renderHook';
import { useScroll } from '../useScroll';

describe('useScroll()', () => {
  describe('init', () => {
    it('should init position', () => {
      const initialPosition = { index: 0, offset: 10, options: true };
      const hookRef = renderHook(() => useScroll(initialPosition));
      expect(hookRef.current.scrollPosition).toEqual(initialPosition);
    });
    it('should init position with default offset and options', () => {
      const initialPosition = { index: 0 };
      const hookRef = renderHook(() => useScroll(initialPosition));
      expect(hookRef.current.scrollPosition).toEqual({
        index: 0,
        offset: 0,
        options: true,
      });
    });
  });

  describe('setScrollPosition()', () => {
    it('should update index and offset', () => {
      const initialPosition = { index: 0, offset: 10 };

      const hookRef = renderHook(() => useScroll(initialPosition));
      act(() =>
        hookRef.current.rememberScrollPosition({ index: 10, offset: 20 }),
      );
      expect(hookRef.current.scrollPosition).toEqual({
        index: 10,
        offset: 20,
        options: true,
      });
    });

    it('should update index with default offset', () => {
      const initialPosition = { index: 0, offset: 10, options: true };

      const hookRef = renderHook(() => useScroll(initialPosition));
      act(() => hookRef.current.rememberScrollPosition({ index: 10 }));
      expect(hookRef.current.scrollPosition).toEqual({
        index: 10,
        offset: 0,
        options: true,
      });
    });
  });
});
