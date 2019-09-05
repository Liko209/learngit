/*
 * @Author: Lex Huang (lex.huang@ringcentral.com)
 * @Date: 2019-06-13 16:17:53
 * Copyright © RingCentral. All rights reserved.
 */
import { formatPhoneNumber } from '@/modules/common/container/PhoneNumberFormat';
import { LazyFormatPhoneViewModel } from '../LazyFormatPhone.ViewModel';

import { container, decorate, injectable } from 'framework/ioc';
import { TelephonyStore } from '../../../../store';
import { PhoneNumberType } from 'sdk/module/phoneNumber/entity';
import i18next from 'i18next';

let lazyFormatPhoneViewModel: LazyFormatPhoneViewModel | undefined;
decorate(injectable(), TelephonyStore);

container.bind(TelephonyStore).to(TelephonyStore);

jest.mock('@/modules/common/container/PhoneNumberFormat');
jest.mock('i18next');
jest.spyOn(i18next, 't').mockReturnValue('Blocked');
beforeEach(() => {
  lazyFormatPhoneViewModel = undefined;
});

describe('LazyFormatPhoneViewModel', () => {
  describe('formatPhoneNumber', () => {
    it('Should not call `formatPhoneNumber` if receives `Blocked`', () => {
      const value = PhoneNumberType.Blocked;
      lazyFormatPhoneViewModel = new LazyFormatPhoneViewModel({
        value,
      });
      lazyFormatPhoneViewModel.formattedPhoneNumber;
      expect(i18next.t).toHaveBeenCalled();
      expect(formatPhoneNumber).not.toBeCalledWith(value);
    });

    it('Should not call `formatPhoneNumber` if has not been rendered', () => {
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
      expect(formatPhoneNumber).toBeCalledWith(value, true);
    });
  });
});
