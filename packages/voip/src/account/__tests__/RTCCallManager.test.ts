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
import { ALLOW_CALL_FLAG } from '../types';

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
  notifyNoAudioStateEvent = jest.fn();
  notifyNoAudioDataEvent = jest.fn();
  getCallByUuid = jest.fn();

  isReady(): boolean {
    return this.isReadyReturnValue;
  }
}

describe('RTCCallManager', () => {
  it('should allowCall() return true when current call count < 1 [JPT-803],[JPT-2717]', () => {
    const callManager = new RTCCallManager();
    expect(callManager.allowCall()).toBe(true);
  });

  it('should allowCall() return true if current call count = 1 when make extra outbound call [JPT-2719], [JPT-804],[JPT-2722]', () => {
    const callManager = new RTCCallManager();
    const account = new MockAccountAndCallObserver();
    const call = new RTCCall(false, '123', null, account, account);
    callManager.addCall(call);
    expect(callManager.allowCall()).toBe(false);
    expect(callManager.allowCall(ALLOW_CALL_FLAG.EXTRA_OUTBOUND_CALL)).toBe(
      true,
    );
  });

  it('should allowCall() return false when current call count > 1 [JPT-804],[JPT-2718]', () => {
    const callManager = new RTCCallManager();
    const account = new MockAccountAndCallObserver();
    const call1 = new RTCCall(false, '123', null, account, account);
    const call2 = new RTCCall(false, '123', null, account, account);
    callManager.addCall(call1);
    call1.setCallState(RTC_CALL_STATE.CONNECTED);
    callManager.addCall(call2);
    expect(callManager.allowCall()).toBe(false);
    expect(callManager.allowCall(ALLOW_CALL_FLAG.INBOUND_CALL)).toBe(false);
    expect(callManager.allowCall(ALLOW_CALL_FLAG.EXTRA_OUTBOUND_CALL)).toBe(
      false,
    );
  });

  it('should allowCall() return true when receive incoming call and call count = 1 which state is connected [JPT-2720]', () => {
    const callManager = new RTCCallManager();
    const account = new MockAccountAndCallObserver();
    const call = new RTCCall(false, '123', null, account, account);
    call.setCallState(RTC_CALL_STATE.CONNECTED);
    callManager.addCall(call);
    expect(callManager.allowCall(ALLOW_CALL_FLAG.INBOUND_CALL)).toBe(true);
  });

  it('should allowCall() return false when receive incoming call and call count = 1 which state is not connected [JPT-2721]', () => {
    const callManager = new RTCCallManager();
    const account = new MockAccountAndCallObserver();
    const call = new RTCCall(false, '123', null, account, account);
    callManager.addCall(call);
    call.setCallState(RTC_CALL_STATE.IDLE);
    expect(callManager.allowCall(ALLOW_CALL_FLAG.INBOUND_CALL)).toBe(false);
    call.setCallState(RTC_CALL_STATE.CONNECTING);
    expect(callManager.allowCall(ALLOW_CALL_FLAG.INBOUND_CALL)).toBe(false);
    call.setCallState(RTC_CALL_STATE.DISCONNECTED);
    expect(callManager.allowCall(ALLOW_CALL_FLAG.INBOUND_CALL)).toBe(false);
  });

  it('should not remove call from call manager when use incorrect uuid', () => {
    const callManager = new RTCCallManager();
    const account = new MockAccountAndCallObserver();
    const call = new RTCCall(false, '123', null, account, account);
    callManager.addCall(call);
    callManager.removeCall(`${call.getCallInfo().uuid}1`);
    expect(callManager.callCount()).toBe(1);
  });

  it('should remove call from call manager when use correct uuid', () => {
    const callManager = new RTCCallManager();
    const account = new MockAccountAndCallObserver();
    const callA = new RTCCall(false, '123', null, account, account);
    const callB = new RTCCall(false, '123', null, account, account);
    callManager.addCall(callA);
    callManager.addCall(callB);
    callManager.removeCall(callA.getCallInfo().uuid);
    expect(callManager.callCount()).toBe(1);
  });

  it('should return 0 connected call if call list is empty [JPT-1022]', () => {
    const callManager = new RTCCallManager();
    expect(callManager.connectedCallCount()).toBe(0);
  });

  it('should return empty connected call list if call list is empty [JPT-1023]', () => {
    const callManager = new RTCCallManager();
    expect(callManager.connectedCallList()).toEqual([]);
  });

  it('should return 1 connected call if call list has 1 connected call [JPT-1024]', () => {
    const callManager = new RTCCallManager();
    const account = new MockAccountAndCallObserver();
    const call = new RTCCall(false, '123', null, account, account);
    call.setCallState(RTC_CALL_STATE.CONNECTED);
    callManager.addCall(call);
    expect(callManager.connectedCallCount()).toBe(1);
  });

  it('should return 1 connected call list if call list has 1 connected call [JPT-1025]', () => {
    const callManager = new RTCCallManager();
    const account = new MockAccountAndCallObserver();
    const call = new RTCCall(false, '123', null, account, account);
    call.setCallState(RTC_CALL_STATE.CONNECTED);
    callManager.addCall(call);
    expect(callManager.connectedCallList()).toEqual([call]);
  });

  it('should return 2 connected call if call list has 2 connected calls [JPT-1026]', () => {
    const callManager = new RTCCallManager();
    const account = new MockAccountAndCallObserver();
    const call1 = new RTCCall(false, '123', null, account, account);
    call1.setCallState(RTC_CALL_STATE.CONNECTED);
    callManager.addCall(call1);
    const call2 = new RTCCall(false, '124', null, account, account);
    call2.setCallState(RTC_CALL_STATE.CONNECTED);
    callManager.addCall(call2);
    expect(callManager.connectedCallCount()).toBe(2);
  });

  it('should return 2 connected call list if call list has 2 connected calls [JPT-1027]', () => {
    const callManager = new RTCCallManager();
    const account = new MockAccountAndCallObserver();
    const call1 = new RTCCall(false, '123', null, account, account);
    call1.setCallState(RTC_CALL_STATE.CONNECTED);
    callManager.addCall(call1);
    const call2 = new RTCCall(false, '124', null, account, account);
    call2.setCallState(RTC_CALL_STATE.CONNECTED);
    callManager.addCall(call2);
    expect(callManager.connectedCallList()).toEqual([call1, call2]);
  });

  it.skip('should return 6 connected call if call list has 6 connected calls [JPT-1028]', () => {
    const callManager = new RTCCallManager();
    const account = new MockAccountAndCallObserver();
    const callList: RTCCall[] = [];
    const num = 6;
    let i = 0;
    for (i = 0; i < num; ++i) {
      const call = new RTCCall(false, `123${i}`, null, account, account);
      call.setCallState(RTC_CALL_STATE.CONNECTED);
      callManager.addCall(call);
      callList.push(call);
    }
    const call1 = new RTCCall(false, '123', null, account, account);
    call1.setCallState(RTC_CALL_STATE.IDLE);
    callManager.addCall(call1);
    const call2 = new RTCCall(false, '124', null, account, account);
    call2.setCallState(RTC_CALL_STATE.CONNECTING);
    callManager.addCall(call2);
    const call3 = new RTCCall(false, '124', null, account, account);
    call3.setCallState(RTC_CALL_STATE.DISCONNECTED);
    callManager.addCall(call3);
    expect(callManager.connectedCallCount()).toBe(num);
  });

  it.skip('should return 6 connected call list if call list has 6 connected calls [JPT-1029]', () => {
    const callManager = new RTCCallManager();
    const account = new MockAccountAndCallObserver();
    const callList: RTCCall[] = [];
    const num = 6;
    let i = 0;
    for (i = 0; i < num; ++i) {
      const call = new RTCCall(false, `123${i}`, null, account, account);
      call.setCallState(RTC_CALL_STATE.CONNECTED);
      callManager.addCall(call);
      callList.push(call);
    }
    const call1 = new RTCCall(false, '123', null, account, account);
    call1.setCallState(RTC_CALL_STATE.IDLE);
    callManager.addCall(call1);
    const call2 = new RTCCall(false, '124', null, account, account);
    call2.setCallState(RTC_CALL_STATE.CONNECTING);
    callManager.addCall(call2);
    const call3 = new RTCCall(false, '124', null, account, account);
    call3.setCallState(RTC_CALL_STATE.DISCONNECTED);
    callManager.addCall(call3);
    expect(callManager.connectedCallList()).toEqual(callList);
  });
});
