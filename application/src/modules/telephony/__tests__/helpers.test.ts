/*
 * @Author: Lex Huang (lex.huang@ringcentral.com)
 * @Date: 2019-05-22 15:44:12
 * Copyright © RingCentral. All rights reserved.
 */
import { doGetCaretPosition, focusCampo, sleep } from '../helpers';

describe('helpers', () => {
  describe('doGetCaretPosition', () => {
    it('should return 0', () => {
      expect(
        doGetCaretPosition({
          selectionDirection: 'backward',
          selectionStart: 0,
        }),
      ).toBe(0);
    });
  });

  describe('focusCampo', () => {
    it('should not blur', () => {
      const mockedInput = {
        selectionDirection: 'backward',
        selectionStart: 0,
        blur: jest.fn(),
        value: '',
      };
      focusCampo(mockedInput);
      expect(mockedInput.blur).not.toBeCalled();
    });
  });

  describe('sleep', () => {
    it('should wait 20ms asyncally', async () => {
      const startTime = +new Date();
      const { promise } = sleep(20);
      await promise;
      const endTime = +new Date();
      expect(endTime - startTime >= 20).toBeTruthy();
    });
  });
});
