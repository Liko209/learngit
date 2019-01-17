/*
 * @Author: Jimmy Xu (jimmy.xu@ringcentral.com)
 * @Date: 2019-01-14 10:08:21
 * Copyright © RingCentral. All rights reserved.
 */
import { RTCCallManager } from '../RTCCallManager';
import { RTCCall } from '../../api/RTCCall';
import { IRTCCallDelegate } from '../../api/IRTCCallDelegate';
import { IRTCAccount } from '../IRTCAccount';
import { RTC_CALL_STATE, RTC_CALL_ACTION } from '../../api/types';

class MockAccountAndCallObserver implements IRTCCallDelegate, IRTCAccount {
  createOutgoingCallSession(toNum: string): void {
    this.toNum = toNum;
  }
  removeCallFromCallManager(uuid: string): void {}
  public callState: RTC_CALL_STATE = RTC_CALL_STATE.IDLE;
  public callAction: RTC_CALL_ACTION;
  public isReadyReturnValue: boolean = false;
  public toNum: string = '';

  onCallStateChange(state: RTC_CALL_STATE): void {
    this.callState = state;
  }

  onCallActionSuccess = jest.fn();
  onCallActionFailed = jest.fn();

  isReady(): boolean {
    return this.isReadyReturnValue;
  }
}

describe('RTCCallManager', async () => {
  it('should allowCall() return true when current call count < 1 [JPT-803]', () => {
    const callManager = new RTCCallManager();
    expect(callManager.allowCall()).toBe(true);
  });

  it('should allowCall() return false when current call count >= 1 [JPT-804]', () => {
    const callManager = new RTCCallManager();
    const account = new MockAccountAndCallObserver();
    const call = new RTCCall(false, '123', null, account, account);
    callManager.addCall(call);
    expect(callManager.allowCall()).toBe(false);
  });

  it('should remove call from call manager when use correct uuid', () => {
    const callManager = new RTCCallManager();
    const account = new MockAccountAndCallObserver();
    const call = new RTCCall(false, '123', null, account, account);
    callManager.addCall(call);
    callManager.removeCall(call.getCallInfo().uuid);
    expect(callManager.callCount()).toBe(0);
  });
});
