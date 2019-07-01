/*
 * @Author: Alessia Li (alessia.li@ringcentral.com)
 * @Date: 2019-06-25 15:44:48
 * Copyright © RingCentral. All rights reserved.
 */

import { InputFooterViewModel } from '../InputFooter.ViewModel';
describe('InputFooterViewModel', () => {
  describe('showMarkupTips', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });
    it.each`
      hasInput | expected
      ${true}  | ${true}
      ${false} | ${false}
    `(
      'should be $expected when hasInput is $hasInput',
      ({ hasInput, expected }) => {
        const inputFooterViewModel = new InputFooterViewModel({ hasInput });
        expect(inputFooterViewModel.showMarkupTips).toBe(expected);
      },
    );
  });
});
