/// <reference path="../../__tests__/types.d.ts" />

import { RTCAccountFSM } from '../rtcAccountFSM';
import { RTCAccountManager } from '../rtcAccountManager';

describe('Account manager', async () => {
  it('state transition: network change in ready', async () => {
    const am = new RTCAccountManager(null);
    jest.spyOn(am, 'processReadyOnNetworkChanged');
    const fsm = new RTCAccountFSM(am);
    fsm.doRegister();
    fsm.regSucceed();
    fsm.networkChanged();
    fsm.doRegister();
    expect(fsm.state).toBe('regInProgress');
    expect(am.processReadyOnNetworkChanged).toHaveReturnedWith('ready');
  });

  it('SIP refresh while state is in ready', async () => {
    const am = new RTCAccountManager(null);
    jest.spyOn(am, 'processReadyOnRegSucceed');
    const fsm = new RTCAccountFSM(am);
    fsm.doRegister();
    fsm.regSucceed();
    fsm.regSucceed();
    expect(fsm.state).toBe('ready');
    expect(am.processReadyOnRegSucceed).toHaveBeenCalled();
  });
});
