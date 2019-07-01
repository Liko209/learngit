/*
 * @Author: Lex Huang (lex.huang@ringcentral.com)
 * @Date: 2019-04-11 09:50:10
 * Copyright © RingCentral. All rights reserved.
 */

import { container, decorate, injectable } from 'framework';
import { TelephonyStore } from '../../../store';
import { TelephonyService } from '../../../service/TelephonyService';
import { DialBtnViewModel } from '../DialBtn.ViewModel';
import { TELEPHONY_SERVICE } from '../../../interface/constant';
import { ClientService } from '@/modules/common';
import { CLIENT_SERVICE } from '@/modules/common/interface';

decorate(injectable(), TelephonyStore);
decorate(injectable(), TelephonyService);
decorate(injectable(), ClientService);

container.bind(TelephonyStore).to(TelephonyStore);
container.bind(TELEPHONY_SERVICE).to(TelephonyService);
container.bind(CLIENT_SERVICE).to(ClientService);

let dialBtnViewModel: DialBtnViewModel;

beforeAll(() => {
  dialBtnViewModel = new DialBtnViewModel();
  dialBtnViewModel._telephonyService.makeCall = jest.fn();
  Object.defineProperty(
    dialBtnViewModel._telephonyService,
    'lastCalledNumber',
    {
      get: () => '1',
    },
  );
  dialBtnViewModel._telephonyStore.enterFirstLetterThroughKeypadForInputString = jest.fn();
});

describe('dialBtnViewModel', () => {
  it('should call makeCall function', () => {
    dialBtnViewModel._telephonyStore.inputString = '123';
    dialBtnViewModel.makeCall();
    const _telephonyService: TelephonyService = container.get(
      TELEPHONY_SERVICE,
    );
    expect(_telephonyService.makeCall).toBeCalled();
  });

  it('should call updateInputString function', () => {
    dialBtnViewModel._telephonyStore.enterFirstLetterThroughKeypadForInputString = jest.fn();
    dialBtnViewModel._telephonyStore.inputString = '';
    dialBtnViewModel.makeCall();
    expect(
      dialBtnViewModel._telephonyStore
        .enterFirstLetterThroughKeypadForInputString,
    ).toBeCalled();
  });
});
