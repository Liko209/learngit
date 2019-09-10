/*
 * @Author: Lex Huang (lex.huang@ringcentral.com)
 * @Date: 2019-04-11 09:50:10
 * Copyright © RingCentral. All rights reserved.
 */

import { container, decorate, injectable } from 'framework/ioc';
import { TelephonyStore } from '../../../store';
import { DetachOrAttachViewModel } from '../DialerTitleBar.ViewModel';
import { getEntity } from '@/store/utils';
import { CALL_STATE } from 'sdk/module/telephony/entity';
import { observable } from 'mobx';

jest.mock('@/store/base/fetch/FetchSortableDataListHandler');
jest.mock('@/store/utils');

decorate(injectable(), TelephonyStore);

container.bind(TelephonyStore).to(TelephonyStore);

let dialerTitleBarViewModel: DetachOrAttachViewModel;

let obj: any;
beforeAll(() => {
  obj = observable({
    connectTime: Date.now(),
    callState: CALL_STATE.IDLE,
  });
  (getEntity as jest.Mock).mockReturnValue(obj);
  dialerTitleBarViewModel = new DetachOrAttachViewModel({});
});

describe('dialerTitleBarViewModel', () => {
  it('should return 00:00', () => {
    expect((dialerTitleBarViewModel as any)._timing).toBe('00:00');
  });
  it('should return undefined when isDialer is false', () => {
    dialerTitleBarViewModel.timing;
    expect((dialerTitleBarViewModel as any)._intervalId).toBeDefined();
    obj.callState = CALL_STATE.CONNECTING;
    expect(dialerTitleBarViewModel.isDialer).toBeFalsy();
    obj.callState = CALL_STATE.DISCONNECTING;
    expect(dialerTitleBarViewModel.isDialer).toBeTruthy();
    expect((dialerTitleBarViewModel as any)._intervalId).toBeUndefined();
  });
});
