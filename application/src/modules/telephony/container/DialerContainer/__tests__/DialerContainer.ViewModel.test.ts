/*
 * @Author: Lex Huang (lex.huang@ringcentral.com)
 * @Date: 2019-04-10 18:29:59
 * Copyright © RingCentral. All rights reserved.
 */

import { container, decorate, injectable } from 'framework';
import { DialerContainerViewModel } from '../DialerContainer.ViewModel';
import { TelephonyStore } from '../../../store';
import { TELEPHONY_SERVICE } from '../../../interface/constant';
import { TelephonyService } from '../../../service/TelephonyService';
import { ClientService } from '@/modules/common';
import { CLIENT_SERVICE } from '@/modules/common/interface';

decorate(injectable(), TelephonyStore);
decorate(injectable(), TelephonyService);
decorate(injectable(), ClientService);

container.bind(TelephonyStore).to(TelephonyStore);
container.bind(TELEPHONY_SERVICE).to(TelephonyService);
container.bind(CLIENT_SERVICE).to(ClientService);

let dialerContainerViewModel: DialerContainerViewModel;

beforeAll(() => {
  dialerContainerViewModel = new DialerContainerViewModel();
  dialerContainerViewModel._telephonyService.setCallerPhoneNumber = jest.fn();
  dialerContainerViewModel._telephonyService.dtmf = jest.fn();
  dialerContainerViewModel._telephonyService.playBeep = jest.fn();
  dialerContainerViewModel._telephonyService.onAfterDialerOpen = jest.fn();
  dialerContainerViewModel._telephonyStore.enterFirstLetterThroughKeypadForInputString = jest.fn();
});

describe('DialerContainerViewModel', () => {
  it('Should initialize with keypad not entered', async () => {
    expect(dialerContainerViewModel.keypadEntered).toBe(false);
  });

  it('Should initialize with keypad not focused', async () => {
    expect(dialerContainerViewModel.dialerFocused).toBeFalsy();
  });

  it('Should initialize with dialer input being available', async () => {
    expect(dialerContainerViewModel.canClickToInput).toBe(true);
  });

  it('Should should call setCallerPhoneNumber', async () => {
    dialerContainerViewModel.setCallerPhoneNumber('a');
    expect(
      dialerContainerViewModel._telephonyService.setCallerPhoneNumber,
    ).toBeCalled();
  });

  it('Should call concatInputString on the telphony service', () => {
    dialerContainerViewModel.clickToInput('1');
    expect(dialerContainerViewModel._telephonyStore.forwardString).toEqual('1');
  });
  it('should return chosenCallerPhoneNumber on TelephonyStore', () => {
    const phoneNumber = '650-123-641';
    dialerContainerViewModel._telephonyStore.chosenCallerPhoneNumber = phoneNumber;
    expect(dialerContainerViewModel.chosenCallerPhoneNumber).toBe(phoneNumber);
  });

  it('Should return false while initializing', () => {
    expect(dialerContainerViewModel.isForward).toBe(false);
  });

  it('Should not focus dialer', () => {
    expect(dialerContainerViewModel.dialerInputFocused).toBeFalsy();
  });

  it('Should return dialer entered state', () => {
    expect(dialerContainerViewModel.enteredDialer).toBeFalsy();
  });
  it('Should call onAfterDialerOpen on the telphony service', () => {
    dialerContainerViewModel.onAfterDialerOpen();
    expect(
      dialerContainerViewModel._telephonyService.onAfterDialerOpen,
    ).toHaveBeenCalled();
  });
});
