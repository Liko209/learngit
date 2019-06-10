/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2019-03-01 23:13:35
 * Copyright © RingCentral. All rights reserved.
 */
import { TelephonyStore, INCOMING_STATE } from '../TelephonyStore';
import { CALL_WINDOW_STATUS } from '../../FSM';
import { ServiceLoader } from 'sdk/module/serviceLoader';

import { getEntity } from '@/store/utils';
import {
  HOLD_STATE,
  RECORD_STATE,
  CALL_STATE,
  CALL_DIRECTION,
  MUTE_STATE,
} from 'sdk/module/telephony/entity';
import CallModel from '@/store/models/Call';

jest.mock('@/store/utils');

const mockState = (prop: keyof CallModel, value: any) =>
  (getEntity as jest.Mock).mockReturnValue({
    [prop]: value,
  });

jest.spyOn(ServiceLoader, 'getInstance').mockReturnValue({
  matchContactByPhoneNumber: jest.fn(),
});

(TelephonyStore as any).autorun = jest.fn();

function createStore() {
  return new TelephonyStore();
}

describe('Telephony store', () => {
  beforeEach(() => {
    (getEntity as jest.Mock).mockReturnValue({});
  });

  it('callWindowState should to be CALL_WINDOW_STATUS.MINIMIZED and callState should to be undefined when instantiated TelephonyStore', () => {
    const store = createStore();
    expect(store.callWindowState).toBe(CALL_WINDOW_STATUS.MINIMIZED);
    expect(store.callState).toBe(undefined);
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

  it('callState should to be CALL_STATE.DISCONNECTED when call end function and call from dialer', () => {
    const store = createStore();
    store.openDialer();
    store.dialerCall();
    store.end();
    mockState('callState', CALL_STATE.DISCONNECTED);
    expect(store.callWindowState).toBe(CALL_WINDOW_STATUS.FLOATING);
    expect(store.call.callState).toBe(CALL_STATE.DISCONNECTED);
  });

  it('callState should to be CALL_STATE.DISCONNECTED when call end function and call not from dialer', () => {
    let store = createStore();
    store.incomingCall();
    expect(store.callWindowState).toBe(CALL_WINDOW_STATUS.FLOATING);
    mockState('direction', CALL_DIRECTION.INBOUND);

    expect(store.inbound).toBeTruthy;
    mockState('callState', CALL_STATE.CONNECTED);
    expect(store.callState).toBe(CALL_STATE.CONNECTED);
    store.end();
    mockState('callState', CALL_STATE.DISCONNECTED);
    expect(store.callWindowState).toBe(CALL_WINDOW_STATUS.MINIMIZED);
    expect(store.callState).toBe(CALL_STATE.DISCONNECTED);

    store = createStore();
    store.incomingCall();
    store.end();
    mockState('callState', CALL_STATE.DISCONNECTED);
    expect(store.callWindowState).toBe(CALL_WINDOW_STATUS.MINIMIZED);
    expect(store.callState).toBe(CALL_STATE.DISCONNECTED);

    store = createStore();
    store.incomingCall();
    store.end();
    mockState('callState', CALL_STATE.DISCONNECTED);
    expect(store.callWindowState).toBe(CALL_WINDOW_STATUS.MINIMIZED);
    expect(store.callState).toBe(CALL_STATE.DISCONNECTED);

    store = createStore();
    store.directCall();
    mockState('callState', CALL_STATE.CONNECTED);
    expect(store.callWindowState).toBe(CALL_WINDOW_STATUS.FLOATING);
    expect(store.callState).toBe(CALL_STATE.CONNECTED);
    store.end();
    mockState('callState', CALL_STATE.DISCONNECTED);
    expect(store.callWindowState).toBe(CALL_WINDOW_STATUS.MINIMIZED);
    expect(store.callState).toBe(CALL_STATE.DISCONNECTED);

    store = createStore();
    store.directCall();
    store.end();
    mockState('callState', CALL_STATE.DISCONNECTED);
    expect(store.callWindowState).toBe(CALL_WINDOW_STATUS.MINIMIZED);
    expect(store.callState).toBe(CALL_STATE.DISCONNECTED);
  });

  it('holdState should to be HOLD_STATE.DISABLED when instantiated TelephonyStore [JPT-1545]', () => {
    const store = createStore();
    store.directCall();
    mockState('holdState', HOLD_STATE.DISABLE);

    expect(store.holdState).toBe(HOLD_STATE.DISABLE);
  });

  it('holdState should change to HOLD_STATE.IDLE when connected', () => {
    const store = createStore();
    store.directCall();
    mockState('holdState', HOLD_STATE.IDLE);
    expect(store.holdState).toBe(HOLD_STATE.IDLE);
  });

  it('recordDisabled should to be RECORD_DISABLED_STATE.DISABLED when instantiated TelephonyStore', () => {
    const store = createStore();
    store.directCall();
    mockState('recordState', RECORD_STATE.DISABLE);
    expect(store.recordDisabled).toBe(true);
  });

  it('holdState should change to HOLD_STATE.IDLE when connected', () => {
    const store = createStore();
    store.directCall();
    mockState('recordState', RECORD_STATE.IDLE);
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
    mockState('muteState', MUTE_STATE.IDLE);
    expect(store.isMute).toBe(false);
    mockState('muteState', MUTE_STATE.MUTED);
    expect(store.isMute).toBe(true);
    mockState('muteState', MUTE_STATE.IDLE);
    expect(store.isMute).toBe(false);
  });

  it('switch animation', () => {
    const store = createStore();
    expect(store.startMinimizeAnimation).toBe(false);
    store.startAnimation();
    expect(store.startMinimizeAnimation).toBe(true);
    store.stopAnimation();
    expect(store.startMinimizeAnimation).toBe(false);
  });

  it('switch dialer focus', () => {
    const store = createStore();
    expect(store.dialerInputFocused).toBe(false);
    store.onDialerInputFocus();
    expect(store.dialerInputFocused).toBe(true);
    store.onDialerInputBlur();
    expect(store.dialerInputFocused).toBe(false);
  });

  it('reset status when the call status is idle', () => {
    const store = createStore();
    store.callerName = 'name';
    store.phoneNumber = '112233';
    mockState('muteState', MUTE_STATE.MUTED);
    store.directCall();
    store.end();
    mockState('muteState', MUTE_STATE.IDLE);
    expect(store.callerName).toBeUndefined();
    expect(store.phoneNumber).toBeUndefined();
    expect(store.isMute).toBeFalsy();
  });
});
