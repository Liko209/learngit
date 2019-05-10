/*
 * @Author: Lex Huang (lex.huang@ringcentral.com)
 * @Date: 2019-04-11 09:50:10
 * Copyright © RingCentral. All rights reserved.
 */

import { container, Jupiter } from 'framework';
import { TelephonyStore } from '../../../store';
import { TelephonyService } from '../../../service/TelephonyService';
import { DialpadViewModel } from '../Dialpad.ViewModel';
import { CALL_STATE, CALL_WINDOW_STATUS } from '../../../FSM';
import * as telephony from '@/modules/telephony/module.config';
import { TELEPHONY_SERVICE } from '../../../interface/constant';
import { ServiceLoader } from 'sdk/module/serviceLoader';

jest.mock('../../../service/TelephonyService');

const jupiter = container.get(Jupiter);
jupiter.registerModule(telephony.config);

let dialpadViewModel: DialpadViewModel;

beforeAll(() => {
  jest.spyOn(ServiceLoader, 'getInstance').mockReturnValue({
    matchContactByPhoneNumber: jest.fn(),
  });
  dialpadViewModel = new DialpadViewModel();
  dialpadViewModel._telephonyService.maximize = jest.fn();
});

describe('DialpadViewModel', () => {
  it('should return call status', () => {
    const _telephonyStore: TelephonyStore = container.get(TelephonyStore);
    expect(dialpadViewModel._callState).toEqual(_telephonyStore.callState);
  });
  it('should return call window status', () => {
    const _telephonyStore: TelephonyStore = container.get(TelephonyStore);
    expect(dialpadViewModel._callWindowState).toEqual(
      _telephonyStore.callWindowState,
    );
  });
  it('should return show status', () => {
    const _telephonyStore: TelephonyStore = container.get(TelephonyStore);
    expect(dialpadViewModel.showMinimized).toEqual(false);
    _telephonyStore.callState = CALL_STATE.CONNECTING;
    _telephonyStore.callWindowState = CALL_WINDOW_STATUS.MINIMIZED;
    expect(dialpadViewModel.showMinimized).toEqual(true);
    _telephonyStore.callState = CALL_STATE.CONNECTED;
    expect(dialpadViewModel.showMinimized).toEqual(true);
    _telephonyStore.callState = CALL_STATE.IDLE;
    expect(dialpadViewModel.showMinimized).toEqual(false);
  });
  it('should maximize', () => {
    dialpadViewModel.maximize();
    const _telephonyService: TelephonyService = container.get(
      TELEPHONY_SERVICE,
    );
    expect(_telephonyService.maximize).toBeCalled();
  });
});
