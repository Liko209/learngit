/*
 * @Author: Lex Huang (lex.huang@ringcentral.com)
 * @Date: 2019-06-27 11:03:37
 * Copyright © RingCentral. All rights reserved.
 */
import { Fragment } from 'react';
import { container, decorate, injectable } from 'framework/ioc';
import { Jupiter } from 'framework/Jupiter';
import { TelephonyStore } from '../../../store';
import { GenericDialerPanelViewModel } from '../GenericDialerPanel.ViewModel';
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

let genericDialerPanelViewModel: GenericDialerPanelViewModel;

beforeEach(() => {
  genericDialerPanelViewModel = new GenericDialerPanelViewModel({
    inputStringProps: 'inputString',
    onInputEnterKeyDown: jest.fn(),
    CallActionBtn: Fragment,
    displayCallerIdSelector: true,
    onContactSelected: jest.fn(),
    onAfterMount: jest.fn(),
  });
  genericDialerPanelViewModel._telephonyService.playBeep = jest.fn();
  genericDialerPanelViewModel._telephonyStore.forwardString = '';
  genericDialerPanelViewModel._telephonyStore.inputString = '';
  genericDialerPanelViewModel._telephonyService.setCallerPhoneNumber = jest.fn();
});

afterEach(() => {
  jest.resetAllMocks();
  genericDialerPanelViewModel = undefined;
});

describe('GenericDialerPanelViewModel', () => {
  describe('dialerInputFocused', () => {
    it('should get `dialerInputFocused` on TelephonyStore', () => {
      genericDialerPanelViewModel._telephonyStore.onDialerInputFocus();
      expect(genericDialerPanelViewModel.dialerInputFocused).toBeTruthy();
      genericDialerPanelViewModel._telephonyStore.onDialerInputBlur();
      expect(genericDialerPanelViewModel.dialerInputFocused).toBeFalsy();
    });
  });

  describe('enteredDialer', () => {
    it('should get `enteredDialer` on TelephonyStore', () => {
      expect(genericDialerPanelViewModel.enteredDialer).toBeFalsy();
      genericDialerPanelViewModel._telephonyStore.syncDialerEntered(true);
      expect(genericDialerPanelViewModel.enteredDialer).toBeTruthy();
    });
  });

  describe('chosenCallerPhoneNumber', () => {
    it('should get `chosenCallerPhoneNumber` on TelephonyStore', () => {
      Object.defineProperty(
        genericDialerPanelViewModel._telephonyStore,
        'chosenCallerPhoneNumber',
        {
          get: () => 'bar',
        },
      );
      expect(genericDialerPanelViewModel.chosenCallerPhoneNumber).toEqual(
        'bar',
      );
    });
  });

  describe('callerPhoneNumberList', () => {
    it('should get `callerPhoneNumberList` on TelephonyStore', () => {
      Object.defineProperty(
        genericDialerPanelViewModel._telephonyStore,
        'callerPhoneNumberList',
        {
          get: () => [{}],
        },
      );
      expect(genericDialerPanelViewModel.callerPhoneNumberList.length).toEqual(
        1,
      );
    });
  });

  describe('hasDialerOpened', () => {
    it('should get `hasDialerOpened` on TelephonyStore', () => {
      Object.defineProperty(
        genericDialerPanelViewModel._telephonyStore,
        'dialerOpenedCount',
        {
          get: () => 1,
        },
      );
      expect(genericDialerPanelViewModel.hasDialerOpened).toBeTruthy();
      Object.defineProperty(
        genericDialerPanelViewModel._telephonyStore,
        'dialerOpenedCount',
        {
          get: () => 0,
        },
      );
      expect(genericDialerPanelViewModel.hasDialerOpened).toBeFalsy();
    });
  });

  describe('shouldCloseToolTip', () => {
    it('should return true when minimized the dialog', () => {
      genericDialerPanelViewModel._telephonyStore.closeDialer();
      expect(genericDialerPanelViewModel.shouldCloseToolTip).toBeTruthy();
    });

    it('should return true when start the minimize animation the dialog', () => {
      genericDialerPanelViewModel._telephonyStore.startAnimation();
      expect(genericDialerPanelViewModel.shouldCloseToolTip).toBeTruthy();
    });
  });

  describe('inputString', () => {
    describe('Given initialized with `inputString`', () => {
      describe('canClickToInput', () => {
        it('should return false when has more than 30 words', () => {
          const str = Array(30)
            .fill(1)
            .join('');
          genericDialerPanelViewModel._telephonyStore.inputString = str;

          expect(genericDialerPanelViewModel.canClickToInput).toBeFalsy();
        });

        it('should return true when has less than 30 words', () => {
          const str = Array(29)
            .fill(1)
            .join('');
          genericDialerPanelViewModel._telephonyStore.inputString = str;

          expect(genericDialerPanelViewModel.canClickToInput).toBeTruthy();
        });
      });

      describe('trimmedInputString', () => {
        it('should return trim the `inputString`', () => {
          const str = Array(29)
            .fill(' ')
            .join('');
          genericDialerPanelViewModel._telephonyStore.inputString = str;
          expect(genericDialerPanelViewModel.trimmedInputString).toEqual('');
        });
      });

      describe('clickToInput', () => {
        it('should call the `playBeep` on TelephonyService given `canClickToInput` to be `true`', () => {
          const val = '1';
          genericDialerPanelViewModel.clickToInput(val);
          expect(
            genericDialerPanelViewModel._telephonyService.playBeep,
          ).toHaveBeenCalledWith(val);
          expect(genericDialerPanelViewModel.trimmedInputString).toEqual(val);
        });

        it('should not call the `playBeep` on TelephonyService given `canClickToInput` to be `false`', () => {
          const str = Array(30)
            .fill(1)
            .join('');
          genericDialerPanelViewModel._telephonyStore.inputString = str;

          const val = '1';
          genericDialerPanelViewModel.clickToInput(val);
          expect(
            genericDialerPanelViewModel._telephonyService.playBeep,
          ).not.toHaveBeenCalledWith(val);
          expect(genericDialerPanelViewModel.trimmedInputString).toEqual(str);
        });

        it('should not turning `shouldEnterContactSearch` to true [JPT-2311]', () => {
          const val = '1';
          genericDialerPanelViewModel.clickToInput(val);
          expect(
            genericDialerPanelViewModel.shouldEnterContactSearch,
          ).toBeFalsy();
        });
      });

      describe('onChange', () => {
        it('should update the trimmedInputString', () => {
          const value = '123';
          genericDialerPanelViewModel.onChange({
            target: {
              value,
            },
          });

          expect(genericDialerPanelViewModel.trimmedInputString).toEqual(value);
        });
      });

      describe('deleteInputString', () => {
        it('should turning trimmedInputString to ``', () => {
          const value = '123';
          genericDialerPanelViewModel.onChange({
            target: {
              value,
            },
          });
          genericDialerPanelViewModel.deleteAllInputString();
          expect(genericDialerPanelViewModel.trimmedInputString).toEqual('');
        });
      });

      describe('onKeyDown', () => {
        it('should not call `onInputEnterKeyDown` on props when hit the enter with no inputs', () => {
          genericDialerPanelViewModel.onKeyDown({
            key: 'Enter',
          });
          expect(
            genericDialerPanelViewModel.props.onInputEnterKeyDown,
          ).not.toHaveBeenCalled();
        });

        it('should call `onInputEnterKeyDown` on props when hit the enter with first letter input through keypad', () => {
          const val = '1';
          genericDialerPanelViewModel.clickToInput(val);
          genericDialerPanelViewModel.onKeyDown({
            key: 'Enter',
          });
          expect(
            genericDialerPanelViewModel.props.onInputEnterKeyDown,
          ).toHaveBeenCalled();
        });

        it('should not call `onInputEnterKeyDown` on props when hit the space with first letter input through keypad', () => {
          const val = '1';
          genericDialerPanelViewModel.clickToInput(val);
          genericDialerPanelViewModel.onKeyDown({
            key: 'Space',
          });
          expect(
            genericDialerPanelViewModel.props.onInputEnterKeyDown,
          ).not.toHaveBeenCalled();
        });

        it('should not call `onInputEnterKeyDown` on props when entered contact searh page', () => {
          const value = '123';
          genericDialerPanelViewModel.onChange({
            target: {
              value,
            },
          });
          genericDialerPanelViewModel.onKeyDown({
            key: 'Enter',
          });
          expect(
            genericDialerPanelViewModel.props.onInputEnterKeyDown,
          ).not.toHaveBeenCalled();
        });
      });
    });

    describe('Given initialized with `forwardString`', () => {
      describe('canClickToInput', () => {
        it('should return false when has more than 30 words', () => {
          genericDialerPanelViewModel = new GenericDialerPanelViewModel({
            inputStringProps: 'forwardString',
            onInputEnterKeyDown: jest.fn(),
            CallActionBtn: Fragment,
            displayCallerIdSelector: true,
            onContactSelected: jest.fn(),
            onAfterMount: jest.fn(),
          });

          const str = Array(30)
            .fill(1)
            .join('');
          genericDialerPanelViewModel._telephonyStore.forwardString = str;

          expect(genericDialerPanelViewModel.canClickToInput).toBeFalsy();
        });

        it('should return true when has less than 30 words', () => {
          genericDialerPanelViewModel = new GenericDialerPanelViewModel({
            inputStringProps: 'forwardString',
            onInputEnterKeyDown: jest.fn(),
            CallActionBtn: Fragment,
            displayCallerIdSelector: true,
            onContactSelected: jest.fn(),
            onAfterMount: jest.fn(),
          });

          const str = Array(29)
            .fill(1)
            .join('');
          genericDialerPanelViewModel._telephonyStore.forwardString = str;

          expect(genericDialerPanelViewModel.canClickToInput).toBeTruthy();
        });

        it('should not turning `shouldEnterContactSearch` to true', () => {
          genericDialerPanelViewModel = new GenericDialerPanelViewModel({
            inputStringProps: 'forwardString',
            onInputEnterKeyDown: jest.fn(),
            CallActionBtn: Fragment,
            displayCallerIdSelector: true,
            onContactSelected: jest.fn(),
            onAfterMount: jest.fn(),
          });

          const val = '1';
          genericDialerPanelViewModel.clickToInput(val);
          expect(
            genericDialerPanelViewModel.shouldEnterContactSearch,
          ).toBeFalsy();
        });
      });

      describe('trimmedInputString', () => {
        it('should return trim the `forwardString`', () => {
          genericDialerPanelViewModel = new GenericDialerPanelViewModel({
            inputStringProps: 'forwardString',
            onInputEnterKeyDown: jest.fn(),
            CallActionBtn: Fragment,
            displayCallerIdSelector: true,
            onContactSelected: jest.fn(),
            onAfterMount: jest.fn(),
          });

          const str = Array(29)
            .fill(' ')
            .join('');
          genericDialerPanelViewModel._telephonyStore.forwardString = str;
          expect(genericDialerPanelViewModel.trimmedInputString).toEqual('');
        });
      });

      describe('clickToInput', () => {
        it('should call the `playBeep` on TelephonyService given `canClickToInput` to be `true`', () => {
          genericDialerPanelViewModel = new GenericDialerPanelViewModel({
            inputStringProps: 'forwardString',
            onInputEnterKeyDown: jest.fn(),
            CallActionBtn: Fragment,
            displayCallerIdSelector: true,
            onContactSelected: jest.fn(),
            onAfterMount: jest.fn(),
          });

          const val = '1';
          genericDialerPanelViewModel.clickToInput(val);
          expect(
            genericDialerPanelViewModel._telephonyService.playBeep,
          ).toHaveBeenCalledWith(val);
          expect(genericDialerPanelViewModel.trimmedInputString).toEqual(val);
        });

        it('should not call the `playBeep` on TelephonyService given `canClickToInput` to be `false`', () => {
          genericDialerPanelViewModel = new GenericDialerPanelViewModel({
            inputStringProps: 'forwardString',
            onInputEnterKeyDown: jest.fn(),
            CallActionBtn: Fragment,
            displayCallerIdSelector: true,
            onContactSelected: jest.fn(),
            onAfterMount: jest.fn(),
          });

          const str = Array(30)
            .fill(1)
            .join('');
          genericDialerPanelViewModel._telephonyStore.forwardString = str;

          const val = '1';
          genericDialerPanelViewModel.clickToInput(val);
          expect(
            genericDialerPanelViewModel._telephonyService.playBeep,
          ).not.toHaveBeenCalledWith(val);
          expect(genericDialerPanelViewModel.trimmedInputString).toEqual(str);
        });
      });

      describe('onChange', () => {
        it('should update the trimmedInputString', () => {
          const value = '123';
          genericDialerPanelViewModel = new GenericDialerPanelViewModel({
            inputStringProps: 'forwardString',
            onInputEnterKeyDown: jest.fn(),
            CallActionBtn: Fragment,
            displayCallerIdSelector: true,
            onContactSelected: jest.fn(),
            onAfterMount: jest.fn(),
          });

          genericDialerPanelViewModel.onChange({
            target: {
              value,
            },
          });

          expect(genericDialerPanelViewModel.trimmedInputString).toEqual(value);
        });
      });

      describe('deleteInputString', () => {
        it('should turning trimmedInputString to ``', () => {
          genericDialerPanelViewModel = new GenericDialerPanelViewModel({
            inputStringProps: 'forwardString',
            onInputEnterKeyDown: jest.fn(),
            CallActionBtn: Fragment,
            displayCallerIdSelector: true,
            onContactSelected: jest.fn(),
            onAfterMount: jest.fn(),
          });

          const value = '123';
          genericDialerPanelViewModel.onChange({
            target: {
              value,
            },
          });
          genericDialerPanelViewModel.deleteAllInputString();
          expect(genericDialerPanelViewModel.trimmedInputString).toEqual('');
        });
      });

      describe('onKeyDown', () => {
        it('should not call `onInputEnterKeyDown` on props when hit the enter with no inputs', () => {
          genericDialerPanelViewModel = new GenericDialerPanelViewModel({
            inputStringProps: 'forwardString',
            onInputEnterKeyDown: jest.fn(),
            CallActionBtn: Fragment,
            displayCallerIdSelector: true,
            onContactSelected: jest.fn(),
            onAfterMount: jest.fn(),
          });

          genericDialerPanelViewModel.onKeyDown({
            key: 'Enter',
          });
          expect(
            genericDialerPanelViewModel.props.onInputEnterKeyDown,
          ).not.toHaveBeenCalled();
        });

        it('should call `onInputEnterKeyDown` on props when hit the enter with first letter input through keypad', () => {
          genericDialerPanelViewModel = new GenericDialerPanelViewModel({
            inputStringProps: 'forwardString',
            onInputEnterKeyDown: jest.fn(),
            CallActionBtn: Fragment,
            displayCallerIdSelector: true,
            onContactSelected: jest.fn(),
            onAfterMount: jest.fn(),
          });

          const val = '1';
          genericDialerPanelViewModel.clickToInput(val);
          genericDialerPanelViewModel.onKeyDown({
            key: 'Enter',
          });
          expect(
            genericDialerPanelViewModel.props.onInputEnterKeyDown,
          ).toHaveBeenCalled();
        });

        it('should not call `onInputEnterKeyDown` on props when hit the space with first letter input through keypad', () => {
          genericDialerPanelViewModel = new GenericDialerPanelViewModel({
            inputStringProps: 'forwardString',
            onInputEnterKeyDown: jest.fn(),
            CallActionBtn: Fragment,
            displayCallerIdSelector: true,
            onContactSelected: jest.fn(),
            onAfterMount: jest.fn(),
          });

          const val = '1';
          genericDialerPanelViewModel.clickToInput(val);
          genericDialerPanelViewModel.onKeyDown({
            key: 'Space',
          });
          expect(
            genericDialerPanelViewModel.props.onInputEnterKeyDown,
          ).not.toHaveBeenCalled();
        });

        it('should not call `onInputEnterKeyDown` on props when entered contact searh page', () => {
          genericDialerPanelViewModel = new GenericDialerPanelViewModel({
            inputStringProps: 'forwardString',
            onInputEnterKeyDown: jest.fn(),
            CallActionBtn: Fragment,
            displayCallerIdSelector: true,
            onContactSelected: jest.fn(),
            onAfterMount: jest.fn(),
          });

          const value = '123';
          genericDialerPanelViewModel.onChange({
            target: {
              value,
            },
          });
          genericDialerPanelViewModel.onKeyDown({
            key: 'Enter',
          });
          expect(
            genericDialerPanelViewModel.props.onInputEnterKeyDown,
          ).not.toHaveBeenCalled();
        });
      });
    });
  });

  describe('onFocus', () => {
    it('should set `dialerInputFocused` to true', () => {
      genericDialerPanelViewModel.onFocus();
      expect(
        genericDialerPanelViewModel._telephonyStore.dialerInputFocused,
      ).toBeTruthy();
    });
  });

  describe('onBlur', () => {
    it('should set `dialerInputFocused` to true', () => {
      genericDialerPanelViewModel.onBlur();
      expect(
        genericDialerPanelViewModel._telephonyStore.dialerInputFocused,
      ).toBeFalsy();
    });
  });

  describe('onAfterDialerOpen', () => {
    it('should call `onAfterMount` on props', () => {
      genericDialerPanelViewModel.onAfterDialerOpen();
      expect(genericDialerPanelViewModel.props.onAfterMount).toHaveBeenCalled();
    });
  });

  describe('setCallerPhoneNumber', () => {
    it('should call `setCallerPhoneNumber()` on TelephonyService', () => {
      const val = '1';
      genericDialerPanelViewModel.setCallerPhoneNumber(val);
      expect(
        genericDialerPanelViewModel._telephonyService.setCallerPhoneNumber,
      ).toHaveBeenCalledWith(val);
    });
  });

  describe('shouldDisplayRecentCalls', () => {
    it('should not display RecentCalls by default', () => {
      expect(genericDialerPanelViewModel.shouldDisplayRecentCalls).toBeFalsy();
    });
  });
});
