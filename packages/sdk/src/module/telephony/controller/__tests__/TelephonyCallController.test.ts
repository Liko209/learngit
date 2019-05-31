/*
 * @Author: Lewi Li (lewi.li@ringcentral.com)
 * @Date: 2019-02-28 22:29:08
 * Copyright © RingCentral. All rights reserved.
 */
import { TelephonyCallController } from '../TelephonyCallController';
import { ITelephonyCallDelegate } from '../../service/ITelephonyCallDelegate';
import {
  RTC_CALL_STATE,
  RTCCall,
  RTC_REPLY_MSG_PATTERN,
  RTC_REPLY_MSG_TIME_UNIT,
  RTC_CALL_ACTION,
} from 'voip';
import {
  Call,
  HOLD_STATE,
  CALL_STATE,
  RECORD_STATE,
  MUTE_STATE,
} from '../../entity';
import notificationCenter from 'sdk/service/notificationCenter';
import { ENTITY } from 'sdk/service/eventKey';
import { IEntitySourceController } from 'sdk/framework/controller/interface/IEntitySourceController';
import { IEntityCacheController } from 'sdk/framework/controller/interface/IEntityCacheController';
import { IdModel, ModelIdType } from 'sdk/framework/model';

jest.mock('voip');
jest.mock('sdk/service/notificationCenter');

describe('TelephonyCallController', () => {
  class MockDelegate implements ITelephonyCallDelegate {
    onCallStateChange(callId: string, state: RTC_CALL_STATE) {}
  }

  class MockEntitySource {
    put() {}
    update() {}
  }

  class MockEntityCache {
    getSynchronously() {}
  }

  function clearMocks() {
    jest.clearAllMocks();
    jest.resetModules();
    jest.restoreAllMocks();
  }

  let mockDelegate;
  let callController: TelephonyCallController;
  let rtcCall: RTCCall;
  let mockEntitySource: MockEntitySource;
  let mockEntityCache: MockEntityCache;
  const callId = '123';

  function setup() {
    mockDelegate = new MockDelegate();
    mockEntitySource = new MockEntitySource();
    mockEntityCache = new MockEntityCache();
    callController = new TelephonyCallController(
      1,
      mockDelegate,
      mockEntitySource,
      mockEntityCache,
    );

    rtcCall = new RTCCall(false, '', null, null, null);
    Object.assign(callController, {
      _rtcCall: rtcCall,
    });
    jest.spyOn(mockDelegate, 'onCallStateChange');
  }

  beforeEach(() => {
    clearMocks();
    setup();
  });

  describe('hangUp', () => {
    it('should call rtc hangup when controller hangup is called', () => {
      jest.spyOn(rtcCall, 'hangup');
      callController._handleCallStateChanged = jest.fn();
      callController.hangUp();
      expect(callController._handleCallStateChanged).toBeCalledWith(
        RTC_CALL_STATE.DISCONNECTED,
      );
      expect(rtcCall.hangup).toBeCalled();
    });
  });

  describe('mute', () => {
    it('should call rtc mute when controller mute is called', () => {
      jest.spyOn(rtcCall, 'mute');
      callController._updateCallMuteState = jest.fn();
      callController.mute();
      expect(callController._updateCallMuteState).toBeCalledWith(
        MUTE_STATE.MUTED,
      );
      expect(rtcCall.mute).toBeCalled();
    });
  });

  describe('unmute', () => {
    it('should call rtc unmute when controller unmute is called', () => {
      jest.spyOn(rtcCall, 'unmute');
      callController._updateCallMuteState = jest.fn();
      callController.unmute();
      expect(callController._updateCallMuteState).toBeCalledWith(
        MUTE_STATE.IDLE,
      );
      expect(rtcCall.unmute).toBeCalled();
    });
  });

  describe('hold', () => {
    it('should resolve when call is held successfully', (done: jest.DoneCallback) => {
      const options = {};
      expect.assertions(2);
      callController._updateCallHoldState = jest.fn();
      callController.hold().then(result => {
        expect(result).toEqual(options);
        done();
      });
      expect(callController._updateCallHoldState).toBeCalledWith(
        HOLD_STATE.HELD,
      );
      callController.onCallActionSuccess(RTC_CALL_ACTION.HOLD, options);
    });

    it('should reject when call hold is failed', (done: jest.DoneCallback) => {
      callController._updateCallHoldState = jest.fn();
      expect.assertions(3);
      callController
        .hold()
        .then(result => {
          done();
        })
        .catch(result => {
          expect(result).toEqual('');
          done();
        });
      expect(callController._updateCallHoldState).toBeCalledWith(
        HOLD_STATE.HELD,
      );
      callController.onCallActionFailed(RTC_CALL_ACTION.HOLD);
      expect(callController._updateCallHoldState).toBeCalledWith(
        HOLD_STATE.IDLE,
      );
    });
  });

  describe('unhold', () => {
    it('should resolve when call is unhold successfully', (done: jest.DoneCallback) => {
      const options = {};
      expect.assertions(2);
      callController._updateCallHoldState = jest.fn();
      callController.unhold().then(result => {
        expect(result).toEqual(options);
        done();
      });
      expect(callController._updateCallHoldState).toBeCalledWith(
        HOLD_STATE.IDLE,
      );
      callController.onCallActionSuccess(RTC_CALL_ACTION.UNHOLD, options);
    });

    it('should reject when call unhold is failed', (done: jest.DoneCallback) => {
      callController._updateCallHoldState = jest.fn();
      expect.assertions(3);
      callController
        .unhold()
        .then(result => {
          done();
        })
        .catch(result => {
          expect(result).toEqual('');
          done();
        });
      expect(callController._updateCallHoldState).toBeCalledWith(
        HOLD_STATE.IDLE,
      );
      callController.onCallActionFailed(RTC_CALL_ACTION.UNHOLD);
      expect(callController._updateCallHoldState).toBeCalledWith(
        HOLD_STATE.HELD,
      );
    });
  });

  describe('startRecord', () => {
    it('should resolve when startRecord is successfully', (done: jest.DoneCallback) => {
      const options = {};
      expect.assertions(2);
      callController._updateCallRecordState = jest.fn();
      callController.startRecord().then(result => {
        expect(result).toEqual(options);
        done();
      });
      expect(callController._updateCallRecordState).toBeCalledWith(
        RECORD_STATE.RECORDING,
      );
      callController.onCallActionSuccess(RTC_CALL_ACTION.START_RECORD, options);
    });

    it('should reject when startRecord is failed', (done: jest.DoneCallback) => {
      callController._updateCallRecordState = jest.fn();
      expect.assertions(3);
      callController
        .startRecord()
        .then(result => {
          done();
        })
        .catch(result => {
          expect(result).toEqual('');
          done();
        });
      expect(callController._updateCallRecordState).toBeCalledWith(
        RECORD_STATE.RECORDING,
      );
      callController.onCallActionFailed(RTC_CALL_ACTION.START_RECORD);
      expect(callController._updateCallRecordState).toBeCalledWith(
        RECORD_STATE.IDLE,
      );
    });
  });

  describe('stopRecord', () => {
    it('should resolve when stopRecord is successfully', (done: jest.DoneCallback) => {
      const options = {};
      expect.assertions(2);
      callController._updateCallRecordState = jest.fn();
      callController.stopRecord().then(result => {
        expect(result).toEqual(options);
        done();
      });
      expect(callController._updateCallRecordState).toBeCalledWith(
        RECORD_STATE.IDLE,
      );
      callController.onCallActionSuccess(RTC_CALL_ACTION.STOP_RECORD, options);
    });

    it('should reject when stopRecord is failed', (done: jest.DoneCallback) => {
      callController._updateCallRecordState = jest.fn();
      expect.assertions(3);
      callController
        .stopRecord()
        .then(result => {
          done();
        })
        .catch(result => {
          expect(result).toEqual('');
          done();
        });
      expect(callController._updateCallRecordState).toBeCalledWith(
        RECORD_STATE.IDLE,
      );
      callController.onCallActionFailed(RTC_CALL_ACTION.STOP_RECORD);
      expect(callController._updateCallRecordState).toBeCalledWith(
        RECORD_STATE.RECORDING,
      );
    });
  });

  describe('dtmf', () => {
    it('should call rtc to dtmf', () => {
      jest.spyOn(rtcCall, 'dtmf');
      const dtmfNumber = '98';
      callController.dtmf(dtmfNumber);
      expect(rtcCall.dtmf).toBeCalledWith(dtmfNumber);
    });
  });

  describe('answer', () => {
    it('should call rtc answer when controller answer is called', () => {
      jest.spyOn(rtcCall, 'answer');
      callController.answer();
      expect(rtcCall.answer).toBeCalled();
    });
  });

  describe('sendToVoiceMail', () => {
    it('should call rtc to send call to voice mail', () => {
      jest.spyOn(rtcCall, 'sendToVoicemail');
      callController.sendToVoiceMail();
      expect(rtcCall.sendToVoicemail).toBeCalled();
    });
  });

  describe('ignore', () => {
    it('should call rtc to ignore call', () => {
      jest.spyOn(rtcCall, 'ignore');
      callController.ignore();
      expect(rtcCall.ignore).toBeCalled();
    });
  });

  describe('startReply', () => {
    it('should call rtc to start reply', () => {
      jest.spyOn(rtcCall, 'startReply');
      callController.startReply();
      expect(rtcCall.startReply).toBeCalled();
    });
  });

  describe('replyWithMessage', () => {
    it('should call rtc to reply with message', () => {
      jest.spyOn(rtcCall, 'replyWithMessage');
      const msg = 'test messages';
      callController.replyWithMessage(msg);
      expect(rtcCall.replyWithMessage).toBeCalledWith(msg);
    });
  });

  describe('replyWithPattern', () => {
    it('should call rtc to reply with pattern', () => {
      jest.spyOn(rtcCall, 'replyWithPattern');
      const pattern = RTC_REPLY_MSG_PATTERN.WILL_CALL_YOU_BACK_LATER;
      const time = 10;
      const timeUnit = RTC_REPLY_MSG_TIME_UNIT.MINUTE;
      callController.replyWithPattern(pattern, time, timeUnit);
      expect(rtcCall.replyWithPattern).toBeCalledWith(pattern, time, timeUnit);
    });
  });

  describe('onCallStateChange', () => {
    beforeEach(() => {
      jest.spyOn(rtcCall, 'getCallInfo').mockReturnValue({
        uuid: callId,
      });
      callController._handleCallStateChanged = jest.fn();
    });
    it('should pass the idle state to call controller', () => {
      callController.onCallStateChange(RTC_CALL_STATE.IDLE);
      expect(mockDelegate.onCallStateChange).toBeCalledWith(
        callId,
        RTC_CALL_STATE.IDLE,
      );
    });

    it('should pass the connected state to call controller', () => {
      callController.onCallStateChange(RTC_CALL_STATE.CONNECTED);
      expect(mockDelegate.onCallStateChange).toBeCalledWith(
        callId,
        RTC_CALL_STATE.CONNECTED,
      );
    });

    it('should pass the connecting state to call controller', () => {
      callController.onCallStateChange(RTC_CALL_STATE.CONNECTING);
      expect(mockDelegate.onCallStateChange).toBeCalledWith(
        callId,
        RTC_CALL_STATE.CONNECTING,
      );
    });

    it('should pass the disconnected state to call controller', () => {
      callController.onCallStateChange(RTC_CALL_STATE.DISCONNECTED);
      expect(mockDelegate.onCallStateChange).toBeCalledWith(
        callId,
        RTC_CALL_STATE.DISCONNECTED,
      );
    });
  });

  describe('_updateCallHoldState', () => {
    it('should update and notify entity changes ', () => {
      const call = {
        hold_state: 0,
      };
      callController._getCallEntity = jest.fn().mockReturnValue(call);
      const spy = jest.spyOn(notificationCenter, 'emitEntityUpdate');
      callController._updateCallHoldState(HOLD_STATE.DISABLE);
      expect(spy).toBeCalledWith(ENTITY.CALL, [
        {
          hold_state: HOLD_STATE.DISABLE,
        },
      ]);
    });

    it('should not update and notify when no entity is got', () => {
      clearMocks();
      callController._getCallEntity = jest.fn().mockReturnValue(null);
      const spy = jest.spyOn(notificationCenter, 'emitEntityUpdate');
      callController._updateCallHoldState(HOLD_STATE.DISABLE);
      expect(spy).not.toBeCalled();
    });
  });

  describe('_handleCallStateChanged', () => {
    it('should update call state and hold when state is connected', () => {
      jest.spyOn(rtcCall, 'getCallInfo').mockReturnValue({ sessionId: '123' });
      Date.now = jest.fn().mockReturnValue(1);
      callController._getCallEntity = jest.fn().mockReturnValue({});
      const spy = jest.spyOn(notificationCenter, 'emitEntityUpdate');
      callController._handleCallStateChanged(RTC_CALL_STATE.CONNECTED);
      expect(spy).toBeCalledWith(ENTITY.CALL, [
        {
          call_state: CALL_STATE.CONNECTED,
          hold_state: HOLD_STATE.IDLE,
          record_state: RECORD_STATE.IDLE,
          connectTime: 1,
          session_id: '123',
        },
      ]);
    });
    it('should update call state and hold when state is connecting', () => {
      callController._getCallEntity = jest.fn().mockReturnValue({});
      const spy = jest.spyOn(notificationCenter, 'emitEntityUpdate');
      callController._handleCallStateChanged(RTC_CALL_STATE.CONNECTING);
      expect(spy).toBeCalledWith(ENTITY.CALL, [
        {
          call_state: CALL_STATE.CONNECTING,
        },
      ]);
    });

    it('should update call state and hold when state is disconnected', () => {
      callController._getCallEntity = jest.fn().mockReturnValue({});
      const spy = jest.spyOn(notificationCenter, 'emitEntityUpdate');
      callController._handleCallStateChanged(RTC_CALL_STATE.DISCONNECTED);
      expect(spy).toBeCalledWith(ENTITY.CALL, [
        {
          call_state: CALL_STATE.DISCONNECTED,
          disconnectTime: 1,
        },
      ]);
    });
  });

  describe('setRtcCall', () => {
    it('should update call info to entity', () => {
      const spy = jest.spyOn(notificationCenter, 'emitEntityUpdate');
      callController._getCallEntity = jest.fn().mockReturnValue({});
      callController.setRtcCall({
        getCallInfo: jest.fn().mockReturnValue({
          toNum: '1',
          fromNum: '2',
          uuid: '3',
        }),
        isIncomingCall: jest.fn().mockReturnValue(true),
      });
      expect(spy).toBeCalledWith(ENTITY.CALL, [
        {
          to_num: '1',
          from_num: '2',
          call_id: '3',
          direction: 'inbound',
        },
      ]);
    });
  });

  describe('park', () => {
    beforeEach(() => {
      clearMocks();
      setup();
    });
    it('should resolve with park id', async (done: jest.DoneCallback) => {
      const options = {
        parkExtension: '801',
      };
      expect.assertions(1);
      callController.park().then(result => {
        expect(result).toEqual(options);
        done();
      });
      callController.onCallActionSuccess(RTC_CALL_ACTION.PARK, options);
    });
    it('should reject with error', (done: jest.DoneCallback) => {
      expect.assertions(1);
      callController
        .park()
        .then(result => {
          done();
        })
        .catch(result => {
          expect(result).toEqual('');
          done();
        });
      callController.onCallActionFailed(RTC_CALL_ACTION.PARK);
    });
  });

  describe('flip', () => {
    beforeEach(() => {
      clearMocks();
      setup();
    });
    it('should resolve with success', (done: jest.DoneCallback) => {
      const options = {};
      expect.assertions(1);
      callController.flip('number').then(result => {
        expect(result).toEqual(options);
        done();
      });
      callController.onCallActionSuccess(RTC_CALL_ACTION.FLIP, options);
    });
    it('should reject with error', (done: jest.DoneCallback) => {
      expect.assertions(1);
      callController
        .flip('number')
        .then(result => {
          done();
        })
        .catch(result => {
          expect(result).toEqual('');
          done();
        });
      callController.onCallActionFailed(RTC_CALL_ACTION.FLIP);
    });
  });
  describe('forward', () => {
    beforeEach(() => {
      clearMocks();
      setup();
    });
    it('should resolve with success', (done: jest.DoneCallback) => {
      const options = {};
      expect.assertions(1);
      callController.forward('number').then(result => {
        expect(result).toEqual(options);
        done();
      });
      callController.onCallActionSuccess(RTC_CALL_ACTION.FORWARD, options);
    });
    it('should reject with error', (done: jest.DoneCallback) => {
      expect.assertions(1);
      callController
        .forward('number')
        .then(result => {
          done();
        })
        .catch(result => {
          expect(result).toEqual('');
          done();
        });
      callController.onCallActionFailed(RTC_CALL_ACTION.FORWARD);
    });
  });
});
