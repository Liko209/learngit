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
  describe('shouldShowTypingIndicator', () => {
    it('should be false when typingList.length is 0 [JPT-2391] 4', () => {
      const inputFooterViewModel = new InputFooterViewModel({ hasInput: true });
      expect(inputFooterViewModel.shouldShowTypingIndicator).toBe(false);
    });
    it('should be true when typingList.length is 2 [JPT-2391] 5', () => {
      mockedTypingList = ['1', '2'];
      const inputFooterViewModel = new InputFooterViewModel({ hasInput: true });
      expect(inputFooterViewModel.shouldShowTypingIndicator).toBe(true);
    });
  });
  describe('shouldShowMarkupTips', () => {
    it.each`
      hasInput | shouldShowTypingIndicator | expected
      ${true}  | ${true}                   | ${false}
      ${true}  | ${false}                  | ${true}
      ${false} | ${true}                   | ${false}
      ${false} | ${false}                  | ${false}
    `(
      'should be $expected when hasInput is $hasInput and shouldShowTypingIndicator is $shouldShowTypingIndicator [JPT-2388]',
      ({ hasInput, shouldShowTypingIndicator, expected }) => {
        mockedTypingList = shouldShowTypingIndicator ? ['1', '2'] : [];
        const inputFooterViewModel = new InputFooterViewModel({ hasInput });
        expect(inputFooterViewModel.shouldShowMarkupTips).toBe(expected);
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
