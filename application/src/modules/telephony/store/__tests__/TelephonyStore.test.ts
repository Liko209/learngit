/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2019-03-01 23:13:35
 * Copyright © RingCentral. All rights reserved.
 */

import { TelephonyStore, INCOMING_STATE } from '../TelephonyStore';
import { CALL_STATE, CALL_WINDOW_STATUS, HOLD_STATE } from '../../FSM';
import { ServiceLoader } from 'sdk/module/serviceLoader';

jest.spyOn(ServiceLoader, 'getInstance').mockReturnValue({
  matchContactByPhoneNumber: jest.fn(),
});
function createStore() {
  return new TelephonyStore();
}

describe('Telephony store', () => {
  it('callWindowState should to be CALL_WINDOW_STATUS.MINIMIZED and callState should to be CALL_STATE.IDLE when instantiated TelephonyStore', () => {
    const store = createStore();
    expect(store.callWindowState).toBe(CALL_WINDOW_STATUS.MINIMIZED);
    expect(store.callState).toBe(CALL_STATE.IDLE);
  });

  /* tslint:disable:max-line-length */
  it('callState should to be correct state when call openDialer function or closeDialer function', () => {
    const store = createStore();
    store.openDialer();
    expect(store.callState).toBe(CALL_STATE.DIALING);
    store.closeDialer();
    expect(store.callState).toBe(CALL_STATE.IDLE);
    store.openDialer();
    store.dialerCall();
    expect(store.callState).toBe(CALL_STATE.CONNECTING);
    store.closeDialer();
    expect(store.callState).toBe(CALL_STATE.CONNECTING);
    store.connected();
    expect(store.callState).toBe(CALL_STATE.CONNECTED);
    store.openDialer();
    expect(store.callState).toBe(CALL_STATE.CONNECTED);
  });

  it('callWindowState should to be correct when call openDialer function', () => {
    const store = createStore();
    store.openDialer();
    expect(store.callWindowState).toBe(CALL_WINDOW_STATUS.FLOATING);
    store.closeDialer();
    expect(store.callWindowState).toBe(CALL_WINDOW_STATUS.MINIMIZED);
    store.openDialer();
    expect(store.callWindowState).toBe(CALL_WINDOW_STATUS.FLOATING);
    store.detachedWindow();
    expect(store.callWindowState).toBe(CALL_WINDOW_STATUS.DETACHED);
    store.closeDialer();
    expect(store.callWindowState).toBe(CALL_WINDOW_STATUS.MINIMIZED);
    store.openDialer();
    expect(store.callWindowState).toBe(CALL_WINDOW_STATUS.DETACHED);
    store.attachedWindow();
    expect(store.callWindowState).toBe(CALL_WINDOW_STATUS.FLOATING);
    store.closeDialer();
    expect(store.callWindowState).toBe(CALL_WINDOW_STATUS.MINIMIZED);
    store.openDialer();
    expect(store.callWindowState).toBe(CALL_WINDOW_STATUS.FLOATING);
  });

  it('callWindowState should to be CALL_WINDOW_STATUS.MINIMIZED when call closeDialer function', () => {
    const store = createStore();
    store.openDialer();
    store.closeDialer();
    expect(store.callWindowState).toBe(CALL_WINDOW_STATUS.MINIMIZED);
  });

  it('callState should to be CALL_STATE.DIALING when call end function and call from dialer', () => {
    const store = createStore();
    store.openDialer();
    store.dialerCall();
    store.connected();
    store.end();
    expect(store.callWindowState).toBe(CALL_WINDOW_STATUS.FLOATING);
    expect(store.callState).toBe(CALL_STATE.DIALING);
  });

  it('callState should to be CALL_STATE.IDLE when call end function and call not from dialer', () => {
    let store = createStore();
    store.incomingCall();
    expect(store.callWindowState).toBe(CALL_WINDOW_STATUS.FLOATING);
    expect(store.callState).toBe(CALL_STATE.INCOMING);
    store.answer();
    expect(store.callState).toBe(CALL_STATE.CONNECTING);
    store.connected();
    expect(store.callState).toBe(CALL_STATE.CONNECTED);
    store.end();
    expect(store.callWindowState).toBe(CALL_WINDOW_STATUS.MINIMIZED);
    expect(store.callState).toBe(CALL_STATE.IDLE);

    store = createStore();
    store.incomingCall();
    store.end();
    expect(store.callWindowState).toBe(CALL_WINDOW_STATUS.MINIMIZED);
    expect(store.callState).toBe(CALL_STATE.IDLE);

    store = createStore();
    store.incomingCall();
    store.answer();
    store.end();
    expect(store.callWindowState).toBe(CALL_WINDOW_STATUS.MINIMIZED);
    expect(store.callState).toBe(CALL_STATE.IDLE);

    store = createStore();
    store.directCall();
    expect(store.callWindowState).toBe(CALL_WINDOW_STATUS.FLOATING);
    expect(store.callState).toBe(CALL_STATE.CONNECTING);
    store.connected();
    expect(store.callState).toBe(CALL_STATE.CONNECTED);
    store.end();
    expect(store.callWindowState).toBe(CALL_WINDOW_STATUS.MINIMIZED);
    expect(store.callState).toBe(CALL_STATE.IDLE);

    store = createStore();
    store.directCall();
    store.end();
    expect(store.callWindowState).toBe(CALL_WINDOW_STATUS.MINIMIZED);
    expect(store.callState).toBe(CALL_STATE.IDLE);
  });

  it('holdState should to be HOLD_STATE.DISABLED when instantiated TelephonyStore [JPT-1545]', () => {
    const store = createStore();
    store.directCall();
    expect(store.holdState).toBe(HOLD_STATE.DISABLED);
  });

  it('holdState should change to HOLD_STATE.IDLE when connected', () => {
    const store = createStore();
    store.directCall();
    store.connected();
    expect(store.holdState).toBe(HOLD_STATE.IDLE);
  });

  it('recordDisabled should to be RECORD_DISABLED_STATE.DISABLED when instantiated TelephonyStore', () => {
    const store = createStore();
    store.directCall();
    expect(store.recordDisabled).toBe(true);
  });

  it('holdState should change to HOLD_STATE.IDLE when connected', () => {
    const store = createStore();
    store.directCall();
    store.connected();
    expect(store.recordDisabled).toBe(false);
  });

  it('directReply()', () => {
    const store = createStore();
    store.directReply();
    expect(store.incomingState).toBe(INCOMING_STATE.REPLY);
  });

  it('quitReply()', () => {
    const store = createStore();
    store.quitReply();
    expect(store.incomingState).toBe(INCOMING_STATE.IDLE);
  });

  it('resetReply()', () => {
    const store = createStore();
    store.resetReply();
    expect(store.replyCountdownTime).toBe(undefined);
    expect(store._intervalReplyId).toBe(undefined);
  });

  it('_createReplyInterval()', () => {
    const store = createStore();
    const time = 55;
    jest.useFakeTimers();
    store._createReplyInterval(time);
    jest.advanceTimersByTime(1000);
    expect(store.replyCountdownTime).toBe(time - 1);
  });

  it('switch between mute and unmute', () => {
    const store = createStore();
    expect(store.isMute).toBe(false);
    store.switchBetweenMuteAndUnmute();
    expect(store.isMute).toBe(true);
    store.switchBetweenMuteAndUnmute();
    expect(store.isMute).toBe(false);
  });
});
