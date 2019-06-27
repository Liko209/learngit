/*
 * @Author: Alessia Li (alessia.li@ringcentral.com)
 * @Date: 2019-06-25 15:44:48
 * Copyright © RingCentral. All rights reserved.
 */

import { InputFooterViewModel } from '../InputFooter.ViewModel';

let mockedTypingList: string[] = [];
const mockedDispose = jest.fn();
jest.mock('../TypingListHandler', () => {
  class TypingListHandler {
    typingList = mockedTypingList;
    dispose = mockedDispose;
  }
  return { TypingListHandler };
});

describe('InputFooterViewModel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  describe('showTypingIndicator', () => {
    it('should be false when typingList.length is 0', () => {
      const inputFooterViewModel = new InputFooterViewModel({ hasInput: true });
      expect(inputFooterViewModel.showTypingIndicator).toBe(false);
    });
    it('should be true when typingList.length is 2', () => {
      mockedTypingList = ['1', '2'];
      const inputFooterViewModel = new InputFooterViewModel({ hasInput: true });
      expect(inputFooterViewModel.showTypingIndicator).toBe(true);
    });
  });
  describe('showMarkupTips', () => {
    it.each`
      hasInput | showTypingIndicator | expected
      ${true}  | ${true}             | ${false}
      ${true}  | ${false}            | ${true}
      ${false} | ${true}             | ${false}
      ${false} | ${false}            | ${false}
    `(
      'should be $expected when hasInput is $hasInput and showTypingIndicator is $showTypingIndicator ',
      ({ hasInput, showTypingIndicator, expected }) => {
        mockedTypingList = showTypingIndicator ? ['1', '2'] : [];
        const inputFooterViewModel = new InputFooterViewModel({ hasInput });
        expect(inputFooterViewModel.showMarkupTips).toBe(expected);
      },
    );
  });
  describe('dispose()', () => {
    it('should call TypingListHandler.dispose when being called', () => {
      const inputFooterViewModel = new InputFooterViewModel({ hasInput: true });
      inputFooterViewModel.dispose();
      expect(mockedDispose).toBeCalled();
    });
  });
});
