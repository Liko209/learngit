/*
 * @Author: isaac.liu
 * @Date: 2019-07-03 15:28:44
 * Copyright © RingCentral. All rights reserved.
 */
window.getSelection = document.getSelection = function () {
  return {
    removeAllRanges: jest.fn(),
    getRangeAt: jest.fn(),
    addRange: jest.fn(),
  };
};

document.createRange = function () {
  return {
    setStart: jest.fn(),
    setEnd: jest.fn()
  }
}
