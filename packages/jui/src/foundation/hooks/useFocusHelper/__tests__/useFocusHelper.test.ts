/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-07-23 13:56:05
 * Copyright © RingCentral. All rights reserved.
 */
import { act } from 'react-dom/test-utils';
import { renderHooks } from 'shield/utils';
import { useFocusHelper } from '../useFocusHelper';

jest.useFakeTimers();

describe('FocusHelper', () => {
  describe('constructor()', () => {
    it('should not focus any item by default', () => {
      const hookRef = renderHooks(() => useFocusHelper());
      expect(hookRef.current.focusedIndex).toBe(-1);
    });

    it('should use initial index', () => {
      const hookRef = renderHooks(() =>
        useFocusHelper({
          initialFocusedIndex: 1,
          items: [
            { text: 'item-0' },
            { text: 'item-1' },
            { text: 'item-2' },
            { text: 'item-3' },
          ],
        }),
      );
      expect(hookRef.current.focusedIndex).toBe(1);
    });

    it.skip('should throw error if initialFocusedIndex out of range', () => {
      expect(() =>
        renderHooks(() =>
          useFocusHelper({
            initialFocusedIndex: 9,
            items: [
              { text: 'item-0' },
              { text: 'item-1' },
              { text: 'item-2' },
              { text: 'item-3' },
            ],
          }),
        ),
      ).toThrow();
    });

    it.skip('should throw error if initial focused item is disabled', () => {
      expect(() =>
        renderHooks(() =>
          useFocusHelper({
            initialFocusedIndex: 0,
            items: [
              { text: 'item-0', disabled: true },
              { text: 'item-1' },
              { text: 'item-2' },
              { text: 'item-3' },
            ],
          }),
        ),
      ).toThrow();
    });
  });

  describe('setFocus()', () => {
    it('should focus given index', () => {
      const hookRef = renderHooks(() =>
        useFocusHelper({
          items: [
            { text: 'item-0' },
            { text: 'item-1' },
            { text: 'item-2' },
            { text: 'item-3' },
          ],
        }),
      );
      act(() => hookRef.current.setFocusedIndex(2));
      expect(hookRef.current.focusedIndex).toBe(2);
    });

    it('should ignore disabled items', () => {
      const hookRef = renderHooks(() =>
        useFocusHelper({
          items: [
            { text: 'item-0' },
            { text: 'item-1' },
            { text: 'item-2', disabled: true },
            { text: 'item-3' },
          ],
        }),
      );
      act(() => hookRef.current.setFocusedIndex(2));
      expect(hookRef.current.focusedIndex).toBe(-1);
    });
  });

  describe('onKeyPress()', () => {
    describe('ArrowUp', () => {
      it('should focus prev item', () => {
        const hookRef = renderHooks(() =>
          useFocusHelper({
            initialFocusedIndex: 2,
            items: [
              { text: 'item-0' },
              { text: 'item-1' },
              { text: 'item-2' },
              { text: 'item-3' },
            ],
            loop: false,
          }),
        );
        act(() => hookRef.current.onKeyPress('ArrowUp'));
        expect(hookRef.current.focusedIndex).toBe(1);
      });

      it('should not change focusedIndex when focusedIndex=0 and loop=false', () => {
        const hookRef = renderHooks(() =>
          useFocusHelper({
            initialFocusedIndex: 0,
            items: [
              { text: 'item-0' },
              { text: 'item-1' },
              { text: 'item-2' },
              { text: 'item-3' },
            ],
            loop: false,
          }),
        );
        act(() => hookRef.current.onKeyPress('ArrowUp'));
        expect(hookRef.current.focusedIndex).toBe(0);
      });

      it('should focus last item when focusedIndex=0 and loop=true', () => {
        const hookRef = renderHooks(() =>
          useFocusHelper({
            initialFocusedIndex: 0,
            items: [
              { text: 'item-0' },
              { text: 'item-1' },
              { text: 'item-2' },
              { text: 'item-3' },
            ],
            loop: true,
          }),
        );
        act(() => hookRef.current.onKeyPress('ArrowUp'));
        expect(hookRef.current.focusedIndex).toBe(3);
      });

      it('should skip disabled items', () => {
        const hookRef = renderHooks(() =>
          useFocusHelper({
            initialFocusedIndex: 2,
            items: [
              { text: 'item-0' },
              { text: 'item-1', disabled: true },
              { text: 'item-2' },
              { text: 'item-3' },
            ],
            loop: false,
          }),
        );
        act(() => hookRef.current.onKeyPress('ArrowUp'));
        expect(hookRef.current.focusedIndex).toBe(0);
      });
    });

    describe('ArrowDown', () => {
      it('should focus next item', () => {
        const hookRef = renderHooks(() =>
          useFocusHelper({
            initialFocusedIndex: 2,
            items: [
              { text: 'item-0' },
              { text: 'item-1' },
              { text: 'item-2' },
              { text: 'item-3' },
            ],
            loop: false,
          }),
        );
        act(() => hookRef.current.onKeyPress('ArrowDown'));
        expect(hookRef.current.focusedIndex).toBe(3);
      });

      it('should not change focusedIndex when focusedIndex=0 and loop=false', () => {
        const hookRef = renderHooks(() =>
          useFocusHelper({
            initialFocusedIndex: 3,
            items: [
              { text: 'item-0' },
              { text: 'item-1' },
              { text: 'item-2' },
              { text: 'item-3' },
            ],
            loop: false,
          }),
        );
        act(() => hookRef.current.onKeyPress('ArrowDown'));
        expect(hookRef.current.focusedIndex).toBe(3);
      });

      it('should focus first item when focusedIndex=lastIndex and loop=true', () => {
        const hookRef = renderHooks(() =>
          useFocusHelper({
            initialFocusedIndex: 3,
            items: [
              { text: 'item-0' },
              { text: 'item-1' },
              { text: 'item-2' },
              { text: 'item-3' },
            ],
            loop: true,
          }),
        );
        act(() => hookRef.current.onKeyPress('ArrowDown'));
        expect(hookRef.current.focusedIndex).toBe(0);
      });

      it('should skip disabled items', () => {
        const hookRef = renderHooks(() =>
          useFocusHelper({
            initialFocusedIndex: 1,
            items: [
              { text: 'item-0' },
              { text: 'item-1' },
              { text: 'item-2', disabled: true },
              { text: 'item-3' },
            ],
          }),
        );
        act(() => hookRef.current.onKeyPress('ArrowDown'));
        expect(hookRef.current.focusedIndex).toBe(3);
      });
    });

    describe('Home', () => {
      it('should focus first item', () => {
        const hookRef = renderHooks(() =>
          useFocusHelper({
            initialFocusedIndex: 2,
            items: [
              { text: 'item-0' },
              { text: 'item-1' },
              { text: 'item-2' },
              { text: 'item-3' },
            ],
            loop: false,
          }),
        );
        act(() => hookRef.current.onKeyPress('Home'));
        expect(hookRef.current.focusedIndex).toBe(0);
      });

      it('should skip disabled items', () => {
        const hookRef = renderHooks(() =>
          useFocusHelper({
            initialFocusedIndex: 3,
            items: [
              { text: 'item-0', disabled: true },
              { text: 'item-1', disabled: true },
              { text: 'item-2' },
              { text: 'item-3' },
            ],
          }),
        );
        act(() => hookRef.current.onKeyPress('Home'));
        expect(hookRef.current.focusedIndex).toBe(2);
      });
    });

    describe('End', () => {
      it('should focus last item', () => {
        const hookRef = renderHooks(() =>
          useFocusHelper({
            initialFocusedIndex: 1,
            items: [
              { text: 'item-0' },
              { text: 'item-1' },
              { text: 'item-2' },
              { text: 'item-3' },
            ],
          }),
        );
        act(() => hookRef.current.onKeyPress('End'));
        expect(hookRef.current.focusedIndex).toBe(3);
      });

      it('should skip disabled items', () => {
        const hookRef = renderHooks(() =>
          useFocusHelper({
            initialFocusedIndex: 0,
            items: [
              { text: 'item-0' },
              { text: 'item-1' },
              { text: 'item-2', disabled: true },
              { text: 'item-3', disabled: true },
            ],
          }),
        );
        act(() => hookRef.current.onKeyPress('End'));
        expect(hookRef.current.focusedIndex).toBe(1);
      });
    });

    describe('Enter/Space', () => {
      it('should not change focus', () => {
        const hookRef = renderHooks(() =>
          useFocusHelper({
            initialFocusedIndex: 0,
            items: [
              { text: 'item-0' },
              { text: 'item-1' },
              { text: 'item-2' },
              { text: 'item-3' },
            ],
          }),
        );
        act(() => hookRef.current.onKeyPress('Enter'));
        act(() => hookRef.current.onKeyPress(' '));
        expect(hookRef.current.focusedIndex).toBe(0);
      });
    });

    describe('Other', () => {
      const ITEMS = [
        { text: 'aa-0' },
        { text: 'ab-1' },
        { text: 'ac-2' },
        { text: 'ba-3' },
        { text: 'bb-4' },
        { text: 'bc-5' },
        { text: 'ca-6' },
        { text: 'cb-7' },
        { text: 'cc-8' },
      ];

      it('should focus first matched item', () => {
        const hookRef = renderHooks(() =>
          useFocusHelper({
            initialFocusedIndex: 0,
            items: ITEMS,
          }),
        );
        act(() => hookRef.current.onKeyPress('b'));
        expect(hookRef.current.focusedIndex).toBe(3);
        act(() => hookRef.current.onKeyPress('c'));
        expect(hookRef.current.focusedIndex).toBe(5);
      });

      it('should restart match if second key pressed after 500ms', () => {
        const hookRef = renderHooks(() =>
          useFocusHelper({
            initialFocusedIndex: 0,
            items: ITEMS,
          }),
        );
        act(() => hookRef.current.onKeyPress('b'));
        jest.advanceTimersByTime(500);
        act(() => hookRef.current.onKeyPress('c'));
        expect(hookRef.current.focusedIndex).toBe(6);
      });

      it('should not change index if matched item is disabled', () => {
        const hookRef = renderHooks(() =>
          useFocusHelper({
            initialFocusedIndex: 0,
            items: [
              { text: 'aa-0' },
              { text: 'ab-1' },
              { text: 'ac-2' },
              { text: 'ba-3' },
              { text: 'bb-4' },
              { text: 'bc-5', disabled: true },
              { text: 'ca-6' },
              { text: 'cb-7' },
              { text: 'cc-8' },
            ],
          }),
        );
        act(() => hookRef.current.onKeyPress('b'));
        act(() => hookRef.current.onKeyPress('c'));
        expect(hookRef.current.focusedIndex).toBe(3);
      });

      it('should be case insensitive', () => {
        const hookRef = renderHooks(() =>
          useFocusHelper({
            initialFocusedIndex: 0,
            items: [{ text: 'a-0' }, { text: 'b-1' }, { text: 'C-2' }],
          }),
        );
        act(() => hookRef.current.onKeyPress('B'));
        expect(hookRef.current.focusedIndex).toBe(1);
        jest.advanceTimersByTime(500);
        act(() => hookRef.current.onKeyPress('c'));
        expect(hookRef.current.focusedIndex).toBe(2);
      });
    });
  });
});
