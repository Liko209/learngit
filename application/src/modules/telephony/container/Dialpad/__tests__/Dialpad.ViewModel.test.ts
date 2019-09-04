/*
 * @Author: Lex Huang (lex.huang@ringcentral.com)
 * @Date: 2019-04-11 09:50:10
 * Copyright © RingCentral. All rights reserved.
 */

import { container } from 'framework/ioc';
import { Jupiter } from 'framework/Jupiter';
import { TelephonyStore } from '../../../store';
import { TelephonyService } from '../../../service/TelephonyService';
import { DialpadViewModel } from '../Dialpad.ViewModel';
import { CALL_WINDOW_STATUS } from '../../../FSM';
import * as telephony from '@/modules/telephony/module.config';
import { TELEPHONY_SERVICE } from '../../../interface/constant';
import { ServiceLoader } from 'sdk/module/serviceLoader';
import { getEntity } from '@/store/utils';
import { CALL_STATE } from 'sdk/module/telephony/entity';
import * as common from '@/modules/common/module.config';
import { observable } from 'mobx';
import * as media from '@/modules/media/module.config';

jest.mock('@/store/utils');
jest.mock('../../../service/TelephonyService');
jest.mock('@/store/base/fetch/FetchSortableDataListHandler');

const jupiter = container.get(Jupiter);
jupiter.registerModule(telephony.config);
jupiter.registerModule(common.config);
jupiter.registerModule(media.config);

let dialpadViewModel: DialpadViewModel;

(TelephonyStore as any)._autorun = jest.fn();

let obj: any;

beforeAll(() => {
  jest.spyOn(ServiceLoader, 'getInstance').mockReturnValue({
    matchContactByPhoneNumber: jest.fn(),
  });
  obj = observable({
    callState: CALL_STATE.IDLE,
    activeCallTime: Date.now(),
  });
  (getEntity as jest.Mock).mockReturnValue(obj);
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
    obj.callState = CALL_STATE.CONNECTING;
    _telephonyStore.callWindowState = CALL_WINDOW_STATUS.MINIMIZED;
    expect(dialpadViewModel.showMinimized).toEqual(true);
    obj.callState = CALL_STATE.CONNECTED;
    expect(dialpadViewModel.showMinimized).toEqual(true);
    obj.callState = CALL_STATE.IDLE;
    expect(dialpadViewModel.showMinimized).toEqual(false);
  });
  it('should maximize', () => {
    dialpadViewModel.maximize();
    const _telephonyService: TelephonyService = container.get(
      TELEPHONY_SERVICE,
    );
    expect(_telephonyService.maximize).toHaveBeenCalled();
  });
  it('should initialize without fade animation', () => {
    expect(dialpadViewModel.startMinimizeAnimation).toBe(false);
  });

  it('should return value of `isConference` on TelephonyStore', () => {
    Object.defineProperty(dialpadViewModel._telephonyStore, 'isConference', {
      get: jest.fn(() => true),
    });
    expect(dialpadViewModel.isConference).toEqual(true);
  });
});
