/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-07-23 13:53:35
 * Copyright © RingCentral. All rights reserved.
 */
import { useState, useRef } from 'react';

type ItemInfo = {
  disabled?: boolean;
  text?: string;
};

type FocusHelperOptions = {
  initialFocusedIndex?: number;
  items?: ItemInfo[];
  loop?: boolean;
};

const TEXT_MATCH_TIMEOUT = 500;

const findPrevEnabledIndex = (
  currentIndex: number,
  disabledIndexes: number[],
) => {
  let result = currentIndex - 1;
  disabledIndexes.reverse().forEach((disabledIndex: number) => {
    if (result === disabledIndex) {
      result--;
    }
  });
  return result;
};

const findNextEnabledIndex = (
  currentIndex: number,
  disabledIndexes: number[],
) => {
  let result = currentIndex + 1;
  disabledIndexes.forEach((disabledIndex: number) => {
    if (result === disabledIndex) {
      result++;
    }
  });
  return result;
};

const useFocusHelper = ({
  loop,
  initialFocusedIndex = -1,
  items = [],
}: FocusHelperOptions = {}) => {
  const disabledIndexes = items
    .map((item: ItemInfo, index: number) => ({ ...item, index }))
    .filter(item => item.disabled)
    .map(({ index }) => index)
    .sort();
  const minIndex = 0;
  const maxIndex = items.length - 1;
  const minEnabledIndex = findNextEnabledIndex(minIndex - 1, disabledIndexes);
  const maxEnabledIndex = findPrevEnabledIndex(maxIndex + 1, disabledIndexes);
  const [focusedIndex, _setFocusedIndex] = useState(initialFocusedIndex);
  const criteria = useRef('');
  const timeoutRef = useRef<number>();

  const validOptions = () => {
    if (initialFocusedIndex === -1) return;

    if (
      initialFocusedIndex < minEnabledIndex ||
      initialFocusedIndex > maxEnabledIndex
    ) {
      throw new Error('Error: Invalid options, out of range.');
    }

    const item = items[initialFocusedIndex];
    if (!(item && !item.disabled)) {
      throw new Error(
        'Error: Invalid options, can not focus on disabled item.',
      );
    }
  };

  const setFocusedIndex = (index: number) => {
    const item = items[index];
    if (index === -1 || (item && !item.disabled)) {
      _setFocusedIndex(index);
    }
  };

  const _handleArrowUp = () => {
    if (focusedIndex - 1 < minEnabledIndex) {
      if (loop) {
        setFocusedIndex(maxEnabledIndex);
      } else {
        setFocusedIndex(
          Math.max(
            findPrevEnabledIndex(focusedIndex, disabledIndexes),
            minEnabledIndex,
          ),
        );
      }
    } else {
      setFocusedIndex(findPrevEnabledIndex(focusedIndex, disabledIndexes));
    }
  };

  const _handleArrowDown = () => {
    if (focusedIndex + 1 > maxEnabledIndex) {
      if (loop) {
        setFocusedIndex(minEnabledIndex);
      } else {
        setFocusedIndex(
          Math.min(
            findNextEnabledIndex(focusedIndex, disabledIndexes),
            maxEnabledIndex,
          ),
        );
      }
    } else {
      setFocusedIndex(findNextEnabledIndex(focusedIndex, disabledIndexes));
    }
  };

  const _handleHome = () => setFocusedIndex(minEnabledIndex);

  const _handleEnd = () => setFocusedIndex(maxEnabledIndex);

  const _handleOtherKeyPress = (key: string) => {
    criteria.current += key.toLowerCase();

    const matchedIndex = items.findIndex(item =>
      Boolean(
        !item.disabled &&
          item.text &&
          item.text.toLowerCase().startsWith(criteria.current),
      ),
    );

    window.clearTimeout(timeoutRef.current);
    timeoutRef.current = window.setTimeout(() => {
      criteria.current = '';
    }, TEXT_MATCH_TIMEOUT);

    if (matchedIndex !== -1) {
      setFocusedIndex(matchedIndex);
    }
  };

  const handleKeyPress = (key: string) => {
    switch (key) {
      case 'ArrowUp':
        _handleArrowUp();
        break;
      case 'ArrowDown':
        _handleArrowDown();
        break;
      case 'Home':
        _handleHome();
        break;
      case 'End':
        _handleEnd();
        break;
      default:
        _handleOtherKeyPress(key);
        break;
      case ' ':
      case 'Enter':
        break;
    }
  };

  validOptions();
  return { focusedIndex, setFocusedIndex, onKeyPress: handleKeyPress };
};

export { useFocusHelper };
