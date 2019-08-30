import { container, decorate, injectable } from 'framework/ioc';
import { TelephonyStore } from '../../../store';
import { CallCtrlPanelViewModel } from '../CallCtrlPanel.ViewModel';
import { getEntity } from '@/store/utils';
import { observable } from 'mobx';
import { ServiceLoader } from 'sdk/module/serviceLoader';

jest.mock('@/store/utils');
jest.mock('@/store/base/fetch/FetchSortableDataListHandler');

decorate(injectable(), TelephonyStore);

container.bind(TelephonyStore).to(TelephonyStore);

let callCtrlPanelViewModel: CallCtrlPanelViewModel;

let call;

jest.spyOn(ServiceLoader, 'getInstance').mockReturnValue({
  matchContactByPhoneNumber: jest.fn().mockResolvedValue({}),
});

beforeEach(() => {
  call = observable({
    toNum: 'bar',
  });
  (getEntity as jest.Mock).mockReturnValue(call);
  callCtrlPanelViewModel = new CallCtrlPanelViewModel();
});

describe('CallCtrlPanelViewModel', () => {
  describe('phone', () => {
    it('Should return value of `phoneNumber` on TelephonyStore', () => {
      // call.direction = 'inbound';
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
      Object.defineProperty(
        callCtrlPanelViewModel._telephonyStore,
        'isContactMatched',
        {
          get: jest.fn(() => true),
        },
      );
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

  describe('isConference', () => {
    it('Should return value of `isConference` on TelephonyStore', () => {
      Object.defineProperty(callCtrlPanelViewModel._telephonyStore, 'isConference', {
        get: jest.fn(() => true),
      });
      expect(callCtrlPanelViewModel.isConference).toEqual(true);
    });
  })
});
