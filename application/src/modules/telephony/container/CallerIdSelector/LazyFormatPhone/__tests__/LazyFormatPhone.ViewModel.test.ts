/*
 * @Author: Lex Huang (lex.huang@ringcentral.com)
 * @Date: 2019-06-13 16:17:53
 * Copyright © RingCentral. All rights reserved.
 */
import { formatPhoneNumber } from '../../helpers';
import { LazyFormatPhoneViewModel } from '../LazyFormatPhone.ViewModel';

let lazyFormatPhoneViewModel: LazyFormatPhoneViewModel | undefined;

jest.mock('../../helpers');
beforeEach(() => {
  lazyFormatPhoneViewModel = undefined;
});

describe('LazyFormatPhoneViewModel', () => {
  describe('onAfterRender', () => {
    it('Should set _mounted to `true` if called', () => {
      lazyFormatPhoneViewModel = new LazyFormatPhoneViewModel({
        value: '+18002076138',
      });
      expect(lazyFormatPhoneViewModel._mounted).toBeFalsy();
      lazyFormatPhoneViewModel.onAfterRender();
      expect(lazyFormatPhoneViewModel._mounted).toBeTruthy();
    });
  });

  describe('formattedPhoneNumber', () => {
    it('Should return default value if has not been rendered', () => {
      const value = '+18002076138';
      lazyFormatPhoneViewModel = new LazyFormatPhoneViewModel({
        value,
      });
      expect(lazyFormatPhoneViewModel.formattedPhoneNumber).toEqual(value);
      expect(formatPhoneNumber).not.toBeCalledWith(value);
    });

    it('Should call `formatPhoneNumber` if has been rendered', () => {
      const value = '+18002076138';
      lazyFormatPhoneViewModel = new LazyFormatPhoneViewModel({
        value,
      });
      lazyFormatPhoneViewModel.onAfterRender();
      lazyFormatPhoneViewModel.formattedPhoneNumber;
      expect(formatPhoneNumber).toBeCalledWith(value);
    });
  });
});
