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

jest.mock('../../../service/TelephonyService');

decorate(injectable(), TelephonyStore);
decorate(injectable(), TelephonyService);

container.bind(TELEPHONY_SERVICE).to(TelephonyService);
container.bind(TelephonyStore).to(TelephonyStore);

let dialBtnViewModel: DialBtnViewModel;

beforeAll(() => {
  dialBtnViewModel = new DialBtnViewModel();
  dialBtnViewModel._telephonyService.makeCall = jest.fn();
  dialBtnViewModel._telephonyService.updateInputString = jest.fn();
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
    dialBtnViewModel._telephonyStore.inputString = '';
    dialBtnViewModel.makeCall();
    const _telephonyService: TelephonyService = container.get(
      TELEPHONY_SERVICE,
    );
    expect(_telephonyService.updateInputString).toBeCalled();
  });
});
