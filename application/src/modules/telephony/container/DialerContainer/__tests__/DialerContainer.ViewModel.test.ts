/*
 * @Author: Lex Huang (lex.huang@ringcentral.com)
 * @Date: 2019-04-10 18:29:59
 * Copyright © RingCentral. All rights reserved.
 */

import { container, Jupiter, decorate, injectable } from 'framework';
import { TelephonyService } from '../../../service/TelephonyService';
import { TELEPHONY_SERVICE } from '../../../interface/constant';

import { DialerContainerViewModel } from '../DialerContainer.ViewModel';
import * as telephony from '@/modules/telephony/module.config';

decorate(injectable(), TelephonyService);
container.bind(TELEPHONY_SERVICE).to(TelephonyService);

const jupiter = container.get(Jupiter);
jupiter.registerModule(telephony.config);

let dialerContainerViewModel: DialerContainerViewModel;

beforeAll(() => {
  container.get = jest.fn().mockReturnValue({});
  jest.spyOn(container, 'get').mockReturnValueOnce({
    keypadEntered: false,
    shouldDisplayDialer: true,
    dialerFocused: false,
    inputString: '',
    maximumInputLength: 30,
  });
  dialerContainerViewModel = new DialerContainerViewModel();
  dialerContainerViewModel._telephonyService.setCallerPhoneNumber = jest.fn();
  dialerContainerViewModel._telephonyService.dtmf = jest.fn();
  dialerContainerViewModel._telephonyService.concatInputString = jest.fn();
});

describe('DialerContainerViewModel', () => {
  it('Should initialize with keypad not entered', async () => {
    expect(dialerContainerViewModel.keypadEntered).toBe(false);
  });
  it('Should initialize with dialer opened', async () => {
    expect(dialerContainerViewModel.isDialer).toBe(true);
  });

  it('Should initialize with keypad not focused', async () => {
    expect(dialerContainerViewModel.dialerFocused).toBe(false);
  });

  it('Should initialize with dialer input being available', async () => {
    expect(dialerContainerViewModel.canTypeString).toBe(true);
  });

  it('Should should call setCallerPhoneNumber', async () => {
    dialerContainerViewModel.setCallerPhoneNumber('a');
    expect(
      dialerContainerViewModel._telephonyService.setCallerPhoneNumber,
    ).toBeCalled();
  });

  it('Should call dtmf on the telphony service', () => {
    dialerContainerViewModel.dtmfThroughKeypad('1');
    expect(dialerContainerViewModel._telephonyService.dtmf).toBeCalled();
  });

  it('Should call concatInputString on the telphony service', () => {
    dialerContainerViewModel.typeString('1');
    expect(
      dialerContainerViewModel._telephonyService.concatInputString,
    ).toBeCalled();
  });
});
