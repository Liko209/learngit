import { container, decorate, injectable } from 'framework';
import { TelephonyStore } from '../../../store';
import { CallCtrlPanelViewModel } from '../CallCtrlPanel.ViewModel';

decorate(injectable(), TelephonyStore);

container.bind(TelephonyStore).to(TelephonyStore);

let callCtrlPanelViewModel: CallCtrlPanelViewModel;

beforeEach(() => {
  callCtrlPanelViewModel = new CallCtrlPanelViewModel();
});

describe('CallCtrlPanelViewModel', () => {
  describe('phone', () => {
    it('Should return value of `phoneNumber` on TelephonyStore', () => {
      Object.defineProperty(
        callCtrlPanelViewModel._telephonyStore,
        'phoneNumber',
        {
          get: jest.fn(() => 'bar'),
        },
      );
      expect(callCtrlPanelViewModel.phone).toEqual('bar');
    });
  });

  describe('isExt', () => {
    it('Should return value of `isExt` on TelephonyStore', () => {
      expect(callCtrlPanelViewModel.isExt).toEqual(false);
    });
  });

  describe('name', () => {
    it('Should return value of `displayName` on TelephonyStore', () => {
      expect(callCtrlPanelViewModel.name).toEqual('');
    });
  });

  describe('uid', () => {
    it('Should return value of `uid` on TelephonyStore', () => {
      Object.defineProperty(callCtrlPanelViewModel._telephonyStore, 'uid', {
        get: jest.fn(() => 'bar'),
      });
      expect(callCtrlPanelViewModel.uid).toEqual('bar');
    });
  });
});
