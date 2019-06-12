/*
 * @Author: Peng Yu (peng.yu@ringcentral.com)
 * @Date: 2019-05-31 16:13:36
 * Copyright © RingCentral. All rights reserved.
 */
import { CallActionsViewModel } from '../CallActions.ViewModel';
import { container, decorate, injectable } from 'framework';
import { TelephonyStore } from '../../../store';
import { CALL_STATE, HOLD_STATE } from '../../../FSM';
import { CALL_ACTION } from '../../../interface/constant';

decorate(injectable(), TelephonyStore);
jest.mock('../../../store');

container.bind(TelephonyStore).to(TelephonyStore);

let vm: CallActionsViewModel;

describe('CallActionsVM', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    vm = new CallActionsViewModel();
  });

  it('park item should be disabled when call is connecting [JPT-2164]', () => {
    const store = container.get(TelephonyStore);
    store.callState = CALL_STATE.CONNECTING;
    const rv = vm.callActionsMap[CALL_ACTION.PARK].shouldDisableAction;
    expect(rv);
  });

  it('park item should be disabled when the call is hold [JPT-2171]', () => {
    const store = container.get(TelephonyStore);
    store.holdState = HOLD_STATE.HOLDED;
    const rv = vm.callActionsMap[CALL_ACTION.PARK].shouldDisableAction;
    expect(rv);
  });
});
