/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2019-03-01 23:13:35
 * Copyright © RingCentral. All rights reserved.
 */
import { TelephonyStore, INCOMING_STATE } from '../TelephonyStore';
import { CALL_WINDOW_STATUS } from '../../FSM';
import { ServiceLoader } from 'sdk/module/serviceLoader';
import { observable } from 'mobx';
import { getEntity } from '@/store/utils';
import * as i18n from '@/utils/i18nT';
import {
  HOLD_STATE,
  RECORD_STATE,
  CALL_STATE,
  CALL_DIRECTION,
  MUTE_STATE,
} from 'sdk/module/telephony/entity';

jest.mock('@/store/utils');
jest.mock('@/store/base/fetch/FetchSortableDataListHandler');

jest.spyOn(ServiceLoader, 'getInstance').mockReturnValue({
  matchContactByPhoneNumber: jest.fn(),
});

let call: any;

function createStore() {
  return new TelephonyStore();
}
describe('Telephony store', () => {
  beforeEach(() => {
    call = observable({
      id: 1,
      holdState: HOLD_STATE.IDLE,
      callState: CALL_STATE.IDLE,
      direction: CALL_DIRECTION.INBOUND,
      muteState: MUTE_STATE.IDLE,
    });
    (getEntity as jest.Mock).mockReturnValue(call);
  });

  it('callWindowState should to be CALL_WINDOW_STATUS.MINIMIZED and callState should to be undefined when instantiated TelephonyStore', () => {
    const store = createStore();
    expect(store.callWindowState).toBe(CALL_WINDOW_STATUS.MINIMIZED);
    expect(store.callState).toBe(CALL_STATE.IDLE);
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
    store.end();
    call.callState = CALL_STATE.DISCONNECTED;
    expect(store.call.callState).toBe(CALL_STATE.DISCONNECTED);
  });

  it('callState should to be CALL_STATE.DISCONNECTED when call end function and call not from dialer', () => {
    let store = createStore();
    store.incomingCall();
    expect(store.callWindowState).toBe(CALL_WINDOW_STATUS.FLOATING);
    call.direction = CALL_DIRECTION.INBOUND;

    expect(store.isInbound).toBeTruthy;
    call.callState = CALL_STATE.CONNECTED;
    expect(store.callState).toBe(CALL_STATE.CONNECTED);
    expect(store.end()).toBe(true);

    store = createStore();
    store.incomingCall();
    store.end();
    expect(store.end()).toBe(true);

    store = createStore();
    store.directCall();
    expect(store.callWindowState).toBe(CALL_WINDOW_STATUS.FLOATING);
    expect(store.end()).toBe(true);

    store = createStore();
    store.directCall();
    store.end();
    expect(store.end()).toBe(true);
  });

  it('holdState should to be HOLD_STATE.DISABLED when instantiated TelephonyStore [JPT-1545]', () => {
    const store = createStore();
    store.directCall();
    call.holdState = HOLD_STATE.DISABLED;

    expect(store.holdState).toBe(HOLD_STATE.DISABLED);
  });

  it('holdState should change to HOLD_STATE.IDLE when connected', () => {
    const store = createStore();
    store.directCall();
    call.holdState = HOLD_STATE.IDLE;
    expect(store.holdState).toBe(HOLD_STATE.IDLE);
  });

  it('recordDisabled should to be RECORD_DISABLED_STATE.DISABLED when instantiated TelephonyStore', () => {
    const store = createStore();
    store.directCall();
    call.recordState = RECORD_STATE.DISABLED;
    expect(store.recordDisabled).toBe(true);
  });

  it('holdState should change to HOLD_STATE.IDLE when connected', () => {
    const store = createStore();
    store.directCall();
    call.recordState = RECORD_STATE.IDLE;
    expect(store.recordDisabled).toBe(false);
  });

  it('directReply()', () => {
    const store = createStore();
    store.directReply();
    expect(store.incomingState).toBe(INCOMING_STATE.REPLY);
  });

  it('directForward()', () => {
    const store = createStore();
    store.directForward();
    expect(store.incomingState).toBe(INCOMING_STATE.FORWARD);
  });

  it('backIncoming()', () => {
    const store = createStore();
    store.backIncoming();
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
    call.muteState = MUTE_STATE.IDLE;
    expect(store.isMute).toBe(false);
    call.muteState = MUTE_STATE.MUTED;
    expect(store.isMute).toBe(true);
    call.muteState = MUTE_STATE.IDLE;
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
    call.muteState = MUTE_STATE.MUTED;
    store.directCall();
    store.end();
    call.muteState = MUTE_STATE.IDLE;
    expect(store.callerName).toBeUndefined();
    expect(store.phoneNumber).toBeUndefined();
    expect(store.isMute).toBeFalsy();
  });

  it('should sync dialer entered state', () => {
    const store = createStore();
    expect(store.enteredDialer).toBeFalsy();
    store.syncDialerEntered(true);
    expect(store.enteredDialer).toBeTruthy();
    store.syncDialerEntered(false);
    expect(store.enteredDialer).toBeFalsy();
  });

  it('activeCallTime should to be undefined when callState is not CONNECTED', () => {
    const store = createStore();
    expect(store.activeCallTime).toBeUndefined();
    store.directCall();
    call.connectTime = '1';
    expect(store.activeCallTime).toBeDefined();
    store.end();
    call.connectTime = undefined;
    expect(store.activeCallTime).toBeUndefined();
  });

  it('`hasActiveInBoundCall` should be initialized with false', () => {
    const store = createStore();
    expect(store.hasActiveInBoundCall).toBeFalsy();
  });

  it('`onDialerFocus()` should change `dialerFocused` to true', () => {
    const store = createStore();
    store.onDialerFocus();
    expect(store.dialerFocused).toBeTruthy();
  });

  it('`onDialerBlur()` should change `dialerFocused` to false', () => {
    const store = createStore();
    store.onDialerBlur();
    expect(store.dialerFocused).toBeFalsy();
  });

  it('`detachedWindow()` should change `isDetached` to true', () => {
    const store = createStore();
    store.openDialer();
    store.detachedWindow();
    expect(store.isDetached).toBeTruthy();
  });

  it('`attachedWindow()` should change `isDetached` to false', () => {
    const store = createStore();
    store.openDialer();
    store.attachedWindow();
    expect(store.isDetached).toBeFalsy();
  });

  it('jumpToRecentCall()', () => {
    const store = createStore();
    store.jumpToRecentCall();
    expect(store.isRecentCalls).toBeTruthy();
  });

  it('backToDialer()', () => {
    const store = createStore();
    store.backToDialer();
    expect(store.isRecentCalls).toBeFalsy();
  });

  it('should return empty string when phoneNumber is anonymous', () => {
    const call: any = {
      direction: 'Inbound',
      fromNum: 'anonymous',
    };
    (getEntity as jest.Mock).mockReturnValue(call);
    const store = createStore();
    expect(store.phoneNumber).toEqual('');
  });

  it('ids', () => {
    const store = createStore();
    expect(store.ids).toEqual([1]);
  });

  it('rawCalls', () => {
    const store = createStore();
    expect((store as any).rawCalls).toBeDefined();
    expect((store as any).rawCalls.length).toEqual(1);
  });

  it('call', done => {
    const store = createStore();
    expect((store as any).rawCalls).toBeDefined();
    expect((store as any).call).toBeDefined();

    store.switchCurrentCall(1);
    expect(store.currentCallId).toEqual(1);
    // @ts-ignore
    store._sortableListHandler.sortableListStore = { getIds: [1] };
    call.id = 1;
    expect((store as any).call).toBeDefined();
    done();

    // @ts-ignore
    store._sortableListHandler.sortableListStore = { getIds: [] };
    expect((store as any).rawCalls.length).toEqual(0);
    expect((store as any).call).toBeUndefined();
    done();
  });

  it('isMultipleCall', done => {
    const store = createStore();
    expect(store.isMultipleCall).toBeFalsy();
    done();

    // @ts-ignore
    store._sortableListHandler.sortableListStore = { getIds: [1, 2] };
    expect(store.isMultipleCall).toBeTruthy();
    expect(store.isBackToDefaultPos).toBeTruthy();
    done();
  });

  it('isThirdCall', done => {
    const store = createStore();
    expect(store.isThirdCall).toBeFalsy();
    done();

    // @ts-ignore
    store._sortableListHandler.sortableListStore = { getIds: [1, 2] };
    expect(store.isThirdCall).toBeFalsy();
    done();

    // @ts-ignore
    store._sortableListHandler.sortableListStore = { getIds: [1, 2, 3] };
    expect(store.isThirdCall).toBeTruthy();
    done();
  });

  it('isBackToDefaultPos', () => {
    const store = createStore();
    expect(store.isBackToDefaultPos).toBeFalsy();
    expect(store.isMultipleCall).toBeFalsy();
    store.endMultipleIncomingCall();
    expect(store.isBackToDefaultPos).toBeFalsy();

    // @ts-ignore
    store._sortableListHandler.sortableListStore = { getIds: [1, 2] };
    expect(store.isMultipleCall).toBeTruthy();
    store.endMultipleIncomingCall();
    expect(store.isBackToDefaultPos).toBeTruthy();

    store.changeBackToDefaultPos(false);
    expect(store.isBackToDefaultPos).toBeFalsy();
  });

  it('callDisconnecting', () => {
    const store = createStore();
    expect(store.callDisconnecting).toBeFalsy();
    call.callState = CALL_STATE.DISCONNECTING;
    expect(store.callDisconnecting).toBeTruthy();
  });

  it('call init state', () => {
    const store = createStore();
    // @ts-ignore
    store._sortableListHandler.sortableListStore = { getIds: [] };

    expect(store.holdState).toBe(HOLD_STATE.DISABLED);
    expect(store.recordState).toBe(RECORD_STATE.DISABLED);
    expect(store.callState).toBe(CALL_STATE.IDLE);
    expect(store.isMute).toBeFalsy;
    expect(store.activeCallTime).toBe(0);
    expect(store.callConnectingTime).toBe(0);
    expect(store.isInbound).toBeFalsy;
    expect(store.isOutbound).toBeFalsy;
    expect(store.activeCallDirection).toBeUndefined;
    expect(store.uuid).toBe('');
  });
  it('resetValidInputStringNumber()', () => {
    const store = createStore();
    store.resetValidInputStringNumber();
    expect(store.isValidInputStringNumber).toBeFalsy();
  });

  it('setCallItem()', () => {
    const store = createStore();
    store.setCallItem('123', 1);
    expect(store.selectedCallItem).toEqual({
      phoneNumber: '123',
      index: 1,
    });
  });

  it('directToTransferPage()', () => {
    const store = createStore();
    store.inputString = '222';
    store.directToTransferPage();
    expect(store.isTransferPage).toBeTruthy();
    expect(store.inputString).toBe('');
    expect(store._dialerString).toBe('222');
  });

  it('backToDialerFromTransferPage()', () => {
    const store = createStore();
    store._dialerString = '111';
    store.backToDialerFromTransferPage();
    expect(store.isTransferPage).toBeFalsy();
    expect(store.isValidInputStringNumber).toBeFalsy();
    expect(store.inputString).toBe('111');
    expect(store._dialerString).toBe('');
  });

  it('directToWarmTransferPage()', () => {
    const store = createStore();
    store.directToWarmTransferPage();
    expect(store.isWarmTransferPage).toBeTruthy();
  });

  it('backToDialerFromWarmTransferPage()', () => {
    const store = createStore();
    store.backToDialerFromTransferPage();
    expect(store.isWarmTransferPage).toBeFalsy();
  });

  it('completeTransfer()', () => {
    const store = createStore();
    store.completeTransfer();
    expect(store.canCompleteTransfer).toBeTruthy();
  });

  it('processTransfer()', () => {
    const store = createStore();
    store.processTransfer();
    expect(store.canCompleteTransfer).toBeFalsy();
  });

  it('resetCallItem() [JPT-2764]', () => {
    const store = createStore();
    store.resetCallItem();
    expect(store.selectedCallItem).toEqual({
      phoneNumber: '',
      index: NaN,
    });
  });

  describe('_getNotificationCallerInfo', () => {
    beforeEach(() => {
      jest.spyOn(i18n, 'i18nP').mockReturnValueOnce('unknown caller');
    });

    it('Should show unknown caller when SDK notification without caller [JPT-2822]', async () => {
      const store = createStore();

      const info = await store._getNotificationCallerInfo();

      expect(info.displayName).toBe('unknown caller');
    });

    it('Should show unknown caller when SDK notification has not caller name and cannot match contact [JPT-2822]', async () => {
      const store = createStore();

      const extensionNumber = '123456';

      jest.spyOn(store, '_formatPhoneNumber').mockReturnValueOnce(extensionNumber);
      jest.spyOn(store, '_matchPersonByPhoneNumber').mockReturnValueOnce(null);

      const info = await store._getNotificationCallerInfo({ extensionNumber });

      expect(info.displayName).toBe('unknown caller');
    });
  });
});
