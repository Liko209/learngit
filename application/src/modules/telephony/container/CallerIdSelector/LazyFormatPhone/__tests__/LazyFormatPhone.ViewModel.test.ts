/*
 * @Author: Lex Huang (lex.huang@ringcentral.com)
 * @Date: 2019-06-13 16:17:53
 * Copyright © RingCentral. All rights reserved.
 */
import { formatPhoneNumber } from '../../helpers';
import { LazyFormatPhoneViewModel } from '../LazyFormatPhone.ViewModel';

import { container, decorate, injectable } from 'framework';
import { TelephonyStore } from '../../../../store';

let lazyFormatPhoneViewModel: LazyFormatPhoneViewModel | undefined;
decorate(injectable(), TelephonyStore);

container.bind(TelephonyStore).to(TelephonyStore);

jest.mock('../../helpers');
beforeEach(() => {
  lazyFormatPhoneViewModel = undefined;
});

describe('LazyFormatPhoneViewModel', () => {
  describe('formatPhoneNumber', () => {
    it('Should not call `formatPhoneNumber` if has not been rendered', () => {
      const _telephonyStore: TelephonyStore = container.get(TelephonyStore);
      const value = '+18002076138';
      lazyFormatPhoneViewModel = new LazyFormatPhoneViewModel({
        value,
      });
      lazyFormatPhoneViewModel.formattedPhoneNumber;
      expect(formatPhoneNumber).not.toBeCalledWith(value);
    });

    it('Should call `formatPhoneNumber` if has been rendered', () => {
      const _telephonyStore: TelephonyStore = container.get(TelephonyStore);
      _telephonyStore.syncDialerEntered(true);
      const value = '+18002076138';
      lazyFormatPhoneViewModel = new LazyFormatPhoneViewModel({
        value,
      });
      lazyFormatPhoneViewModel.formattedPhoneNumber;
      expect(formatPhoneNumber).toBeCalledWith(value);
    });
  });
});
