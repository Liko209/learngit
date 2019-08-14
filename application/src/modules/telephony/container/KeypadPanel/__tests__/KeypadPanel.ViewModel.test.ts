/*
 * @Author: Lex Huang (lex.huang@ringcentral.com)
 * @Date: 2019-06-27 10:42:22
 * Copyright © RingCentral. All rights reserved.
 */

import { container, decorate, injectable } from 'framework/ioc';
import { Jupiter } from 'framework/Jupiter';
import { TelephonyStore } from '../../../store';
import { KeypadPanelViewModel } from '../KeypadPanel.ViewModel';
import { TELEPHONY_SERVICE } from '../../../interface/constant';
import { TelephonyService } from '../../../service/TelephonyService';
import { ClientService } from '@/modules/common';
import { CLIENT_SERVICE } from '@/modules/common/interface';
import * as media from '@/modules/media/module.config';

jest.mock('@/modules/media/service');

const jupiter = container.get(Jupiter);
jupiter.registerModule(media.config);
decorate(injectable(), TelephonyStore);
decorate(injectable(), TelephonyService);
decorate(injectable(), ClientService);

container.bind(TelephonyStore).to(TelephonyStore);
container.bind(TELEPHONY_SERVICE).to(TelephonyService);
container.bind(CLIENT_SERVICE).to(ClientService);

let keypadPanelViewModel: KeypadPanelViewModel;

beforeEach(() => {
  keypadPanelViewModel = new KeypadPanelViewModel();
  keypadPanelViewModel._telephonyService.playBeep = jest.fn();
  keypadPanelViewModel._telephonyService.dtmf = jest.fn();
});

afterEach(() => {
  jest.resetAllMocks();
  keypadPanelViewModel._telephonyStore.inputString = '';
  keypadPanelViewModel._telephonyStore.quitKeypad();
  keypadPanelViewModel._telephonyStore.onDialerBlur();
});

describe('KeypadPanelViewModel', () => {
  describe('canClickToInput', () => {
    it('should return false when has more than 30 words', () => {
      var str = Array(30)
        .fill(1)
        .join('');
      keypadPanelViewModel._telephonyStore.inputString = str;

      expect(keypadPanelViewModel.canClickToInput).toBeFalsy();
    });

    it('should return true when has less than 30 words', () => {
      var str = Array(29)
        .fill(1)
        .join('');
      keypadPanelViewModel._telephonyStore.inputString = str;

      expect(keypadPanelViewModel.canClickToInput).toBeTruthy();
    });
  });

  describe('dialerFocused', () => {
    it('should return false when not entering the keypad panel', () => {
      expect(keypadPanelViewModel.dialerFocused).toBeFalsy();
    });

    it('should return false when entering the keypad panel while not focusing the dialer', () => {
      keypadPanelViewModel._telephonyStore.openKeypad();
      expect(keypadPanelViewModel.dialerFocused).toBeFalsy();
    });

    it('should return true when entering the keypad panel and focusing the dialer', () => {
      keypadPanelViewModel._telephonyStore.openKeypad();
      keypadPanelViewModel._telephonyStore.onDialerFocus();
      expect(keypadPanelViewModel.dialerFocused).toBeTruthy();
    });
  });

  describe('playAudio', () => {
    it('should not play the audio while canClickToInput is false', () => {
      var str = Array(30)
        .fill(1)
        .join('');
      keypadPanelViewModel._telephonyStore.inputString = str;
      keypadPanelViewModel.playAudio();

      expect(keypadPanelViewModel._telephonyService.playBeep).not.toBeCalled();
    });

    it('should play the audio while canClickToInput is true', () => {
      var str = Array(29)
        .fill(1)
        .join('');
      keypadPanelViewModel._telephonyStore.inputString = str;
      keypadPanelViewModel.playAudio();

      expect(keypadPanelViewModel._telephonyService.playBeep).toBeCalled();
    });
  });

  describe('dtmfThroughKeypad', () => {
    it('should send dtmf and play beep sound', () => {
      keypadPanelViewModel.dtmfThroughKeypad();
      expect(keypadPanelViewModel._telephonyService.playBeep).toBeCalled();
      expect(keypadPanelViewModel._telephonyService.dtmf).toBeCalled();
    });
  });

  describe('dtmfThroughKeyboard', () => {
    it('should not call dtmf given dialer is not focused', () => {
      keypadPanelViewModel.dtmfThroughKeyboard();
      expect(keypadPanelViewModel._telephonyService.playBeep).not.toBeCalled();
      expect(keypadPanelViewModel._telephonyService.dtmf).not.toBeCalled();
    });

    it('should call dtmf given dialer is focused', () => {
      keypadPanelViewModel._telephonyStore.onDialerFocus();

      keypadPanelViewModel.dtmfThroughKeyboard();
      expect(keypadPanelViewModel._telephonyService.playBeep).toBeCalled();
      expect(keypadPanelViewModel._telephonyService.dtmf).toBeCalled();
    });
  });
});
