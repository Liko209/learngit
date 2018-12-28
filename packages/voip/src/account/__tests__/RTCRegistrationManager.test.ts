/// <reference path="../../__tests__/types.d.ts" />
import { RTCRegistrationManager } from '../RTCRegistrationManager';

describe('Registration manager', async () => {
  it('state transition: network change in ready', () => {
    const am = new RTCRegistrationManager(null);
    jest.spyOn(am, 'onReadyWhenNetworkChanged');
    am.doRegister();
    am.regSucceed();
    am.networkChanged();
    expect(am.onReadyWhenNetworkChanged).toHaveBeenCalled();
  });

  it('state transition: from idle to none', async () => {
    const am = new RTCRegistrationManager(null);
    jest.spyOn(am, 'onRegInProgress');
    jest.spyOn(am, 'onLeaveRegInProgress');
    jest.spyOn(am, 'onReady');
    jest.spyOn(am, 'onLeaveReady');
    jest.spyOn(am, 'onUnRegInProgress');
    jest.spyOn(am, 'onLeaveUnRegInProgress');
    jest.spyOn(am, 'onNone');
    am.doRegister();
    am.regSucceed();
    am.deRegister();
    am.deRegSucceed();
    expect(am.onNone).toHaveBeenCalled();
    expect(am.onLeaveUnRegInProgress).toHaveBeenCalled();
    expect(am.onUnRegInProgress).toHaveBeenCalled();
    expect(am.onLeaveReady).toHaveBeenCalled();
    expect(am.onReady).toHaveBeenCalled();
    expect(am.onLeaveRegInProgress).toHaveBeenCalled();
    expect(am.onRegInProgress).toHaveBeenCalled();
  });

  it('SIP refresh while state is in ready', async () => {
    const am = new RTCRegistrationManager(null);
    jest.spyOn(am, 'onReadyWhenRegSucceed');
    am.doRegister();
    am.regSucceed();
    am.regSucceed();
    expect(am.onReadyWhenRegSucceed).toHaveBeenCalled();
  });
});
