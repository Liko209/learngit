/*
 * @Author: Lex Huang (lex.huang@ringcentral.com)
 * @Date: 2019-05-22 15:44:12
 * Copyright © RingCentral. All rights reserved.
 */
import {
  doGetCaretPosition,
  focusCampo,
  sleep,
  toFirstLetterUpperCase,
} from '../helpers';

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
        focus: jest.fn(),
        value: '',
      };
      focusCampo(mockedInput);
      expect(mockedInput.blur).toBeCalled();
    });

    it('should do noting when recieve undefined', () => {
      const cache = window.HTMLInputElement.prototype.focus;
      window.HTMLInputElement.prototype.focus = jest.fn();
      focusCampo(undefined);
      expect(window.HTMLInputElement.prototype.focus).not.toBeCalled();
      window.HTMLInputElement.prototype.focus = cache;
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

  describe('toFirstLetterUpperCase', () => {
    it('should turning the first letter to upper case', () => {
      const val = 'test';
      expect(toFirstLetterUpperCase(val)).toEqual('Test');
    });
  });
});
