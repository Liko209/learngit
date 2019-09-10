/*
 * @Author: Peng Yu (peng.yu@ringcentral.com)
 * @Date: 2019-05-31 16:13:36
 * Copyright © RingCentral. All rights reserved.
 */
import { CallActionsViewModel } from '../CallActions.ViewModel';
import { container, decorate, injectable } from 'framework/ioc';
import { TelephonyStore } from '../../../store';
import { CALL_ACTION } from '../../../interface/constant';
import { getEntity } from '@/store/utils';
import { CALL_STATE, HOLD_STATE } from 'sdk/module/telephony/entity';
import { observable } from 'mobx';

jest.mock('@/store/utils');
decorate(injectable(), TelephonyStore);
jest.mock('../../../store');

container.bind(TelephonyStore).to(TelephonyStore);

let vm: CallActionsViewModel;

let call: any;
describe('CallActionsVM', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    call = observable({
      holdState: HOLD_STATE.IDLE,
      callState: CALL_STATE.IDLE,
    });
    (getEntity as jest.Mock).mockReturnValue(call);
    vm = new CallActionsViewModel();
  });

  it('park item should be disabled when call is connecting [JPT-2164]', () => {
    const store = container.get(TelephonyStore);
    call.callState = CALL_STATE.CONNECTING;
    const rv = vm.callActionsMap[CALL_ACTION.PARK].shouldDisableAction;
    expect(rv);
  });

  it('park item should be disabled when the call is hold [JPT-2171]', () => {
    const store = container.get(TelephonyStore);
    call.holdState = HOLD_STATE.HELD;
    const rv = vm.callActionsMap[CALL_ACTION.PARK].shouldDisableAction;
    expect(rv);
  });
});
