/*
 * @Author: Wayne Zhou (wayne.zhou@ringcentral.com)
 * @Date: 2019-08-08 22:50:11
 * Copyright © RingCentral. All rights reserved.
 */

import { updateShowJumpToLatestButton } from '../utils';
import _ from 'lodash';

function buildAllPossibleCombination(shape) {
  const result = [];
  const keys = Object.keys(shape);

  const walk = (obj, keyIndex) => {
    if (keyIndex === keys.length) {
      result.push(obj);
      return;
    }

    shape[keys[keyIndex]].forEach(value => {
      const newObj = _.cloneDeep(obj);
      newObj[keys[keyIndex]] = value;
      walk(newObj, keyIndex + 1);
    });
  };

  keys.forEach(() => {
    walk({}, 0);
  });

  return result;
}

const allCombination = buildAllPossibleCombination({
  isAtBottom: [true, false, null],
  hasMoreDown: [true, false],
  isAboveScrollToLatestCheckPoint: [true, false],
  buttonShowed: [true, false],
});

const showButtonCriteria = [
  {
    // scroll up
    isAboveScrollToLatestCheckPoint: true,
    hasMoreDown: false,
    isAtBottom: false,
    buttonShowed: false,
  },
  {
    // jump from other place
    isAboveScrollToLatestCheckPoint: false,
    hasMoreDown: true,
    isAtBottom: false,
    buttonShowed: false,
  },
  {
    // edge case, scroll down but didn't load another page
    isAboveScrollToLatestCheckPoint: false,
    hasMoreDown: true,
    isAtBottom: true,
    buttonShowed: false,
  },
  {
    isAtBottom: false,
    hasMoreDown: true,
    isAboveScrollToLatestCheckPoint: true,
    buttonShowed: false,
  },
];

const hideButtonCriteria = [
  {
    // scroll to bottom
    isAboveScrollToLatestCheckPoint: false,
    hasMoreDown: false,
    isAtBottom: true,
    buttonShowed: true,
  },
];

describe('updateShowJumpToLatestButton', () => {
  it('should be true when match show button criteria', () => {
    showButtonCriteria.forEach(obj => {
      expect(updateShowJumpToLatestButton(obj)).toBe(true);
    });
  });

  it('should be false when match hide button criteria', () => {
    hideButtonCriteria.forEach(obj => {
      expect(updateShowJumpToLatestButton(obj)).toBe(false);
    });
  });

  it('should be null when above criteria does not match', () => {
    allCombination.forEach(obj => {
      if (
        showButtonCriteria.find(x => _.isEqual(obj, x)) ||
        hideButtonCriteria.find(x => _.isEqual(obj, x))
      ) {
        return;
      }
      expect(updateShowJumpToLatestButton(obj)).toBe(null);
    });
  });
});
