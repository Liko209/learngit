/// <reference path="../../__tests__/types.d.ts" />

import { RTCRegistrationFSM } from '../rtcRegistrationFSM';
import { RTCRegistrationManager } from '../rtcRegistrationManager';

describe('Account manager', async () => {
  it('state transition: network change in ready', async () => {
    const am = new RTCRegistrationManager(null);
    jest.spyOn(am, 'processReadyOnNetworkChanged');
    const fsm = new RTCRegistrationFSM(am);
    fsm.doRegister();
    fsm.regSucceed();
    fsm.networkChanged();
    fsm.doRegister();
    expect(fsm.state).toBe('regInProgress');
    expect(am.processReadyOnNetworkChanged).toHaveReturnedWith('ready');
  });

  it('SIP refresh while state is in ready', async () => {
    const am = new RTCRegistrationManager(null);
    jest.spyOn(am, 'processReadyOnRegSucceed');
    const fsm = new RTCRegistrationFSM(am);
    fsm.doRegister();
    fsm.regSucceed();
    fsm.regSucceed();
    expect(fsm.state).toBe('ready');
    expect(am.processReadyOnRegSucceed).toHaveBeenCalled();
  });
});
